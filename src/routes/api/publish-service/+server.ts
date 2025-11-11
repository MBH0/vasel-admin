import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { strapiClient } from '$lib/strapi';
import { consumeCSRFToken } from '$lib/auth';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '$lib/rateLimiter';

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

// Helper function to normalize complexity field
function normalizeComplexity(data: any): any {
	if (data.complexity) {
		const complexityMap: Record<string, string> = {
			'basic': 'Básico',
			'intermediate': 'Intermedio',
			'advanced': 'Avanzado',
			'basico': 'Básico',
			'intermedio': 'Intermedio',
			'avanzado': 'Avanzado',
			'básico': 'Básico'
		};

		const normalized = complexityMap[data.complexity.toLowerCase()];
		if (normalized) {
			console.log(`Normalized complexity from "${data.complexity}" to "${normalized}"`);
			data.complexity = normalized;
		} else if (!['Básico', 'Intermedio', 'Avanzado'].includes(data.complexity)) {
			console.warn(`Invalid complexity value "${data.complexity}", defaulting to "Intermedio"`);
			data.complexity = 'Intermedio';
		}
	}

	return data;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// CSRF Protection
		const csrfToken = request.headers.get('x-csrf-token') || cookies.get('csrf_token');
		if (!consumeCSRFToken(csrfToken || '')) {
			return json({ error: 'Invalid or expired CSRF token' }, { status: 403 });
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

		// Sanitize and normalize fields before publishing
		es = sanitizeSEO(es);
		en = sanitizeSEO(en);
		es = normalizeComplexity(es);
		en = normalizeComplexity(en);

		// Create Spanish version (default locale)
		console.log('Creating Spanish service...');
		const esResult = await strapiClient.createService(es, 'es');
		console.log('Spanish service created:', esResult);

		// Extract the ID from the created entry
		const serviceId = esResult.data?.id || esResult.data?.documentId;

		if (!serviceId) {
			throw new Error('Could not get service ID from Strapi response');
		}

		// Wait a bit to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 500));

		// Create English localization linked to Spanish entry
		console.log(`Creating English localization for service ${serviceId}...`);
		const enResult = await strapiClient.createServiceLocalization(serviceId, en, 'en');
		console.log('English localization created:', enResult);

		return json({
			success: true,
			spanish: esResult,
			english: enResult
		}, {
			headers: {
				'X-RateLimit-Limit': String(rateLimit.limit),
				'X-RateLimit-Remaining': String(rateLimit.remaining),
				'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
			}
		});
	} catch (error: any) {
		console.error('Error publishing service:', error);

		// Parse Strapi validation errors for better user feedback
		let errorMessage = error.message || 'Failed to publish service to Strapi';

		if (error.message && error.message.includes('must be unique')) {
			// Extract which fields are duplicated
			if (error.message.includes('name') && error.message.includes('slug')) {
				errorMessage = 'A service with this name already exists in Strapi. Please use a different name or delete the existing service first.';
			} else if (error.message.includes('name')) {
				errorMessage = 'A service with this name already exists in Strapi.';
			} else if (error.message.includes('slug')) {
				errorMessage = 'A service with this slug already exists in Strapi.';
			}
		}

		return json(
			{ error: errorMessage },
			{ status: error.message?.includes('unique') ? 409 : 500 }
		);
	}
};
