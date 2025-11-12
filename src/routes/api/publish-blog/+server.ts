import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { strapiClient } from '$lib/strapi';
import { consumeCSRFToken, generateCSRFToken, verifySession } from '$lib/auth';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '$lib/rateLimiter';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';

// Helper function to regenerate CSRF token after each request
async function regenerateCSRFToken(cookies: Cookies): Promise<string> {
	const newToken = await generateCSRFToken();
	cookies.set('csrf_token', newToken, {
		path: '/',
		httpOnly: false,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 60 * 60 // 1 hour
	});
	return newToken;
}

// Helper function to validate and fix SEO fields
function sanitizeSEO(data: any): any {
	if (data.SEO) {
		// Truncate metaTitle to 60 characters
		if (data.SEO.metaTitle && data.SEO.metaTitle.length > 60) {
			console.warn(`SEO metaTitle truncated from ${data.SEO.metaTitle.length} to 60 chars`);
			data.SEO.metaTitle = data.SEO.metaTitle.substring(0, 60);
		}

		// Truncate metaDescription to 160 characters
		if (data.SEO.metaDescription && data.SEO.metaDescription.length > 160) {
			console.warn(`SEO metaDescription truncated from ${data.SEO.metaDescription.length} to 160 chars`);
			data.SEO.metaDescription = data.SEO.metaDescription.substring(0, 160);
		}
	}

	// Also check lowercase 'seo' field
	if (data.seo) {
		if (data.seo.meta_title && data.seo.meta_title.length > 60) {
			console.warn(`SEO meta_title truncated from ${data.seo.meta_title.length} to 60 chars`);
			data.seo.meta_title = data.seo.meta_title.substring(0, 60);
		}

		if (data.seo.meta_description && data.seo.meta_description.length > 160) {
			console.warn(`SEO meta_description truncated from ${data.seo.meta_description.length} to 160 chars`);
			data.seo.meta_description = data.seo.meta_description.substring(0, 160);
		}
	}

	return data;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Session verification
		const session = cookies.get('session');
		if (!verifySession(session || null)) {
			return json(
				{ error: 'Session expired. Please log in again.' },
				{
					status: 401,
					headers: {
						'X-Session-Expired': 'true'
					}
				}
			);
		}

		// CSRF Protection
		const csrfToken = request.headers.get('x-csrf-token') || cookies.get('csrf_token');
		const csrfValid = await consumeCSRFToken(csrfToken || '');

		// Generate new CSRF token for next request
		const newCSRFToken = await regenerateCSRFToken(cookies);

		if (!csrfValid) {
			return json({ error: 'Invalid or expired CSRF token', csrfToken: newCSRFToken }, { status: 403 });
		}

		// Rate limiting
		const clientId = getClientIdentifier(request);
		const rateLimit = checkRateLimit(clientId, RateLimitPresets.PUBLISH);

		if (!rateLimit.allowed) {
			return json(
				{
					error: RateLimitPresets.PUBLISH.message,
					retryAfter: rateLimit.retryAfter
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(rateLimit.retryAfter || 3600),
						'X-RateLimit-Limit': String(rateLimit.limit),
						'X-RateLimit-Remaining': String(rateLimit.remaining),
						'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
					}
				}
			);
		}

		const body = await request.json();

		let { es, en } = body;

		if (!es || !en) {
			return json({ error: 'Both Spanish and English versions are required' }, { status: 400 });
		}

		// Sanitize SEO fields before publishing
		es = sanitizeSEO(es);
		en = sanitizeSEO(en);

		// Create Spanish version (default locale)
		console.log('Creating Spanish blog...');
		const esResult = await strapiClient.createBlog(es, 'es');
		console.log('Spanish blog created:', esResult);

		// Extract the documentId from the created entry (required for localization in Strapi v4+)
		const documentId = esResult.data?.documentId;

		if (!documentId) {
			throw new Error('Could not get documentId from Strapi response');
		}

		// Wait a bit to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 500));

		// Create English localization linked to Spanish entry
		console.log(`Creating English localization for blog ${documentId}...`);
		const enResult = await strapiClient.createBlogLocalization(documentId, en, 'en');
		console.log('English localization created:', enResult);

		return json({
			success: true,
			spanish: esResult,
			english: enResult,
			csrfToken: newCSRFToken
		}, {
			headers: {
				'X-RateLimit-Limit': String(rateLimit.limit),
				'X-RateLimit-Remaining': String(rateLimit.remaining),
				'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
			}
		});
	} catch (error: any) {
		console.error('Error publishing blog:', error);

		// Parse Strapi validation errors for better user feedback
		let errorMessage = error.message || 'Failed to publish blog to Strapi';

		if (error.message && error.message.includes('must be unique')) {
			// Extract which fields are duplicated
			if (error.message.includes('title') && error.message.includes('slug')) {
				errorMessage = 'A blog with this title already exists in Strapi. Please use a different title or delete the existing blog first.';
			} else if (error.message.includes('title')) {
				errorMessage = 'A blog with this title already exists in Strapi.';
			} else if (error.message.includes('slug')) {
				errorMessage = 'A blog with this slug already exists in Strapi.';
			}
		}

		// Generate new CSRF token for retry
		const retryCSRFToken = await regenerateCSRFToken(cookies);

		return json(
			{ error: errorMessage, csrfToken: retryCSRFToken },
			{ status: error.message?.includes('unique') ? 409 : 500 }
		);
	}
};
