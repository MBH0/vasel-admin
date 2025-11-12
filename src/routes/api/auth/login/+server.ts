import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, createSession, generateCSRFToken } from '$lib/auth';
import { checkRateLimit, resetRateLimit, getClientIdentifier, RateLimitPresets } from '$lib/rateLimiter';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Rate limiting for login attempts
		const clientId = getClientIdentifier(request);
		const rateLimit = checkRateLimit(clientId, RateLimitPresets.LOGIN);

		if (!rateLimit.allowed) {
			return json(
				{
					error: RateLimitPresets.LOGIN.message,
					retryAfter: rateLimit.retryAfter
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(rateLimit.retryAfter || 900),
						'X-RateLimit-Limit': String(rateLimit.limit),
						'X-RateLimit-Remaining': String(rateLimit.remaining),
						'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000))
					}
				}
			);
		}

		const { password } = await request.json();

		if (!password) {
			return json({ error: 'Password is required' }, { status: 400 });
		}

		// Verify password (now async with bcrypt)
		const isValid = await verifyPassword(password);
		if (!isValid) {
			return json({ error: 'Invalid password' }, { status: 401 });
		}

		// Create JWT session
		const sessionToken = createSession();

		// Generate CSRF token (async with Redis)
		const csrfToken = await generateCSRFToken();

		// Set secure session cookie
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev, // HTTPS only in production
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Set CSRF token cookie (accessible to JS for sending in requests)
		cookies.set('csrf_token', csrfToken, {
			path: '/',
			httpOnly: false, // Accessible to JavaScript
			sameSite: 'strict',
			secure: !dev,
			maxAge: 60 * 60 // 1 hour
		});

		// Reset rate limit after successful login
		resetRateLimit(clientId);

		return json({ success: true, csrfToken });
	} catch (error: any) {
		console.error('Login error:', error);
		return json({ error: 'An error occurred during login' }, { status: 500 });
	}
};
