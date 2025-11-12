import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storeCSRFToken, verifyCSRFTokenInRedis, deleteCSRFToken } from './redis';

// Get environment variables at runtime
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || '';
const JWT_SECRET = env.JWT_SECRET || '';

// Password hashing
const SALT_ROUNDS = 12;
let hashedPassword: string | null = null;

// Initialize hashed password on module load
async function initPasswordHash() {
	if (!hashedPassword && ADMIN_PASSWORD) {
		hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
	}
}
initPasswordHash();

export async function verifyPassword(password: string): Promise<boolean> {
	if (!hashedPassword) {
		await initPasswordHash();
	}
	return bcrypt.compare(password, hashedPassword!);
}

// JWT Session Management
interface JWTPayload {
	userId: string;
	role: string;
	iat?: number;
	exp?: number;
}

export function createSession(): string {
	const payload: JWTPayload = {
		userId: 'admin',
		role: 'administrator'
	};

	// Token expires in 7 days
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: '7d',
		issuer: 'vasel-admin',
		audience: 'vasel-admin-users'
	});
}

export function verifySession(token: string | null): boolean {
	if (!token) return false;

	try {
		const decoded = jwt.verify(token, JWT_SECRET, {
			issuer: 'vasel-admin',
			audience: 'vasel-admin-users'
		}) as JWTPayload;

		// Verify required fields
		return decoded.userId === 'admin' && decoded.role === 'administrator';
	} catch (error) {
		// Token expired, invalid signature, or malformed
		return false;
	}
}

// CSRF Token Management with Redis
export async function generateCSRFToken(): Promise<string> {
	const token = jwt.sign(
		{ type: 'csrf', random: Math.random().toString(36) },
		JWT_SECRET,
		{ expiresIn: '1h' }
	);

	// Store token in Redis with automatic expiration
	await storeCSRFToken(token);

	return token;
}

export async function verifyCSRFToken(token: string | null): Promise<boolean> {
	if (!token) return false;

	try {
		// Verify JWT signature and expiration
		const decoded = jwt.verify(token, JWT_SECRET) as any;

		if (decoded.type !== 'csrf') return false;

		// Check if token exists in Redis
		return await verifyCSRFTokenInRedis(token);
	} catch {
		return false;
	}
}

export async function consumeCSRFToken(token: string): Promise<boolean> {
	// Verify token first
	const isValid = await verifyCSRFToken(token);

	if (isValid) {
		// Delete token from Redis to consume it
		await deleteCSRFToken(token);
		return true;
	}

	return false;
}
