import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

// Redis configuration
const REDIS_HOST = env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(env.REDIS_DB || '3', 10); // Database 3 for CSRF tokens
const REDIS_TLS = env.REDIS_TLS === 'true';

// Create Redis client
const redis = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	password: REDIS_PASSWORD,
	db: REDIS_DB,
	retryStrategy(times) {
		const delay = Math.min(times * 50, 2000);
		console.log(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
		return delay;
	},
	maxRetriesPerRequest: 3,
	enableReadyCheck: true,
	lazyConnect: false,
	...(REDIS_TLS && {
		tls: {
			rejectUnauthorized: false // Set to true in production with valid certs
		}
	})
});

// Connection event handlers
redis.on('connect', () => {
	console.log(`✅ Redis connected: ${REDIS_HOST}:${REDIS_PORT} (DB: ${REDIS_DB})`);
});

redis.on('error', (error) => {
	console.error('❌ Redis connection error:', error.message);
});

redis.on('close', () => {
	console.log('⚠️  Redis connection closed');
});

redis.on('reconnecting', () => {
	console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('Closing Redis connection...');
	await redis.quit();
});

process.on('SIGINT', async () => {
	console.log('Closing Redis connection...');
	await redis.quit();
});

export default redis;

// Helper functions for CSRF token management
const CSRF_TOKEN_PREFIX = 'csrf:';
const CSRF_TOKEN_TTL = 60 * 60; // 1 hour in seconds

/**
 * Store CSRF token in Redis with expiration
 */
export async function storeCSRFToken(token: string): Promise<void> {
	const key = `${CSRF_TOKEN_PREFIX}${token}`;
	await redis.setex(key, CSRF_TOKEN_TTL, Date.now().toString());
}

/**
 * Verify if CSRF token exists in Redis
 */
export async function verifyCSRFTokenInRedis(token: string): Promise<boolean> {
	const key = `${CSRF_TOKEN_PREFIX}${token}`;
	const exists = await redis.exists(key);
	return exists === 1;
}

/**
 * Delete CSRF token from Redis (consume it)
 */
export async function deleteCSRFToken(token: string): Promise<boolean> {
	const key = `${CSRF_TOKEN_PREFIX}${token}`;
	const deleted = await redis.del(key);
	return deleted === 1;
}

/**
 * Get all CSRF tokens count (for monitoring)
 */
export async function getCSRFTokenCount(): Promise<number> {
	const keys = await redis.keys(`${CSRF_TOKEN_PREFIX}*`);
	return keys.length;
}

/**
 * Clean all expired CSRF tokens (Redis does this automatically with TTL, but this is for manual cleanup)
 */
export async function cleanExpiredCSRFTokens(): Promise<number> {
	const keys = await redis.keys(`${CSRF_TOKEN_PREFIX}*`);
	let cleaned = 0;

	for (const key of keys) {
		const ttl = await redis.ttl(key);
		if (ttl === -1 || ttl === -2) {
			// -1 = no expiry set, -2 = key doesn't exist
			await redis.del(key);
			cleaned++;
		}
	}

	return cleaned;
}
