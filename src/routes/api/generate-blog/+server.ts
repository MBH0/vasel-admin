import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateBlogContent } from '$lib/ai';
import { verifyCSRFToken } from '$lib/auth';
import { checkRateLimit, getClientIdentifier, RateLimitPresets } from '$lib/rateLimiter';
import { validateBlogInput, ValidationError } from '$lib/validation';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// CSRF Protection (only verify, don't consume - will consume on publish)
		const csrfToken = request.headers.get('x-csrf-token') || cookies.get('csrf_token');
		if (!verifyCSRFToken(csrfToken || '')) {
			return json({ error: 'Invalid or expired CSRF token' }, { status: 403 });
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
		const validatedInput = validateBlogInput(body);

		const content = await generateBlogContent(validatedInput);

		return json(content, {
			headers: {
				'X-RateLimit-Limit': String(rateLimit.limit),
				'X-RateLimit-Remaining': String(rateLimit.remaining),
				'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
			}
		});
	} catch (error: any) {
		console.error('Error generating blog:', error);

		if (error instanceof ValidationError) {
			return json({ error: error.message }, { status: 400 });
		}

		return json(
			{ error: error.message || 'Failed to generate blog content' },
			{ status: 500 }
		);
	}
};
