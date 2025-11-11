/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000; // Clean up every minute

// Cleanup expired entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetAt) {
			rateLimitStore.delete(key);
		}
	}
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
	message?: string;
}

export interface RateLimitResult {
	allowed: boolean;
	limit: number;
	remaining: number;
	resetAt: number;
	retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): RateLimitResult {
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	// No previous requests or window expired
	if (!entry || now > entry.resetAt) {
		const resetAt = now + config.windowMs;
		rateLimitStore.set(identifier, {
			count: 1,
			resetAt
		});

		return {
			allowed: true,
			limit: config.maxRequests,
			remaining: config.maxRequests - 1,
			resetAt
		};
	}

	// Within rate limit window
	if (entry.count < config.maxRequests) {
		entry.count++;
		rateLimitStore.set(identifier, entry);

		return {
			allowed: true,
			limit: config.maxRequests,
			remaining: config.maxRequests - entry.count,
			resetAt: entry.resetAt
		};
	}

	// Rate limit exceeded
	return {
		allowed: false,
		limit: config.maxRequests,
		remaining: 0,
		resetAt: entry.resetAt,
		retryAfter: Math.ceil((entry.resetAt - now) / 1000)
	};
}

/**
 * Reset rate limit for a specific identifier
 * Useful for clearing failed attempts after successful action (e.g., successful login)
 */
export function resetRateLimit(identifier: string): void {
	rateLimitStore.delete(identifier);
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For if behind proxy, otherwise connection IP
 */
export function getClientIdentifier(request: Request): string {
	// Try to get real IP from headers (if behind proxy/CDN)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	// Fallback to a generic identifier
	// In production with a proper server, you'd have access to the connection IP
	return 'unknown-client';
}

// Preset rate limit configurations
export const RateLimitPresets = {
	// For login attempts - strict
	LOGIN: {
		maxRequests: 5,
		windowMs: 15 * 60 * 1000, // 15 minutes
		message: 'Too many login attempts. Please try again in 15 minutes.'
	},
	// For AI generation - moderate
	AI_GENERATION: {
		maxRequests: 10,
		windowMs: 60 * 60 * 1000, // 1 hour
		message: 'Too many AI generation requests. Please try again later.'
	},
	// For publishing to Strapi - moderate
	PUBLISH: {
		maxRequests: 20,
		windowMs: 60 * 60 * 1000, // 1 hour
		message: 'Too many publish requests. Please try again later.'
	},
	// For general API requests - lenient
	GENERAL: {
		maxRequests: 100,
		windowMs: 15 * 60 * 1000, // 15 minutes
		message: 'Too many requests. Please slow down.'
	}
};
