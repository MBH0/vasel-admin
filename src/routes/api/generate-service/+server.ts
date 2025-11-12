import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateServiceContent } from '$lib/ai';
import { consumeCSRFToken, generateCSRFToken } from '$lib/auth';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '$lib/rateLimiter';
import { validateServiceInput, ValidationError } from '$lib/validation';
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

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// CSRF Protection - consume and regenerate token
		const csrfToken = request.headers.get('x-csrf-token') || cookies.get('csrf_token');
		const csrfValid = await consumeCSRFToken(csrfToken || '');

		// Generate new CSRF token for next request
		const newCSRFToken = await regenerateCSRFToken(cookies);

		if (!csrfValid) {
			return json({ error: 'Invalid or expired CSRF token', csrfToken: newCSRFToken }, { status: 403 });
		}

		// Rate limiting
		const clientId = getClientIdentifier(request);
		const rateLimit = checkRateLimit(clientId, RateLimitPresets.AI_GENERATION);

		if (!rateLimit.allowed) {
			return json(
				{
					error: RateLimitPresets.AI_GENERATION.message,
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

		// Validate and sanitize input
		const validatedInput = validateServiceInput(body);

		const content = await generateServiceContent(validatedInput);

		return json({ ...content, csrfToken: newCSRFToken }, {
			headers: {
				'X-RateLimit-Limit': String(rateLimit.limit),
				'X-RateLimit-Remaining': String(rateLimit.remaining),
				'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
			}
		});
	} catch (error: any) {
		console.error('Error generating service:', error);

		// Generate new CSRF token for retry
		const retryCSRFToken = await regenerateCSRFToken(cookies);

		if (error instanceof ValidationError) {
			return json({ error: error.message, csrfToken: retryCSRFToken }, { status: 400 });
		}

		return json(
			{ error: error.message || 'Failed to generate service content', csrfToken: retryCSRFToken },
			{ status: 500 }
		);
	}
};
