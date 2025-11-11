import { redirect, type Handle } from '@sveltejs/kit';
import { verifySession } from '$lib/auth';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');
	const isAuthenticated = verifySession(session || null);

	// Public routes that don't require authentication
	const publicRoutes = ['/login'];
	const isPublicRoute = publicRoutes.some(route => event.url.pathname === route);

	// API routes for login don't need auth
	const isLoginApi = event.url.pathname.startsWith('/api/auth/login');

	// If trying to access protected route without auth, redirect to login
	if (!isAuthenticated && !isPublicRoute && !isLoginApi) {
		throw redirect(303, '/login');
	}

	// If authenticated and trying to access login page, redirect to dashboard
	if (isAuthenticated && event.url.pathname === '/login') {
		throw redirect(303, '/');
	}

	// Add auth status to locals for use in pages
	event.locals.isAuthenticated = isAuthenticated;

	// Resolve the request with security headers
	const response = await resolve(event);

	// Add security headers
	const headers = {
		// Content Security Policy - prevents XSS attacks
		'Content-Security-Policy': [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"img-src 'self' data: https:",
			"font-src 'self' data: https://fonts.gstatic.com",
			"connect-src 'self' http://localhost:1337 https://api.openai.com",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; '),

		// Prevent clickjacking attacks
		'X-Frame-Options': 'DENY',

		// Prevent MIME type sniffing
		'X-Content-Type-Options': 'nosniff',

		// XSS Protection (legacy browsers)
		'X-XSS-Protection': '1; mode=block',

		// Referrer Policy
		'Referrer-Policy': 'strict-origin-when-cross-origin',

		// Permissions Policy (formerly Feature Policy)
		'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
	};

	// Add HSTS header only in production with HTTPS
	if (!dev) {
		headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
	}

	// Set all security headers
	Object.entries(headers).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
};
