import { ADMIN_PASSWORD, JWT_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Password hashing
const SALT_ROUNDS = 12;
let hashedPassword: string | null = null;

// Initialize hashed password on module load
async function initPasswordHash() {
	if (!hashedPassword) {
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

// CSRF Token Management
const csrfTokens = new Map<string, number>();
const CSRF_TOKEN_LIFETIME = 1000 * 60 * 60; // 1 hour

export function generateCSRFToken(): string {
	const token = jwt.sign(
		{ type: 'csrf', random: Math.random().toString(36) },
		JWT_SECRET,
		{ expiresIn: '1h' }
	);

	csrfTokens.set(token, Date.now());
	cleanExpiredCSRFTokens();

	return token;
}

export function verifyCSRFToken(token: string | null): boolean {
	if (!token) return false;

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as any;

		if (decoded.type !== 'csrf') return false;

		const timestamp = csrfTokens.get(token);
		if (!timestamp) return false;

		// Check if token is expired
		if (Date.now() - timestamp > CSRF_TOKEN_LIFETIME) {
			csrfTokens.delete(token);
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

export function consumeCSRFToken(token: string): boolean {
	if (verifyCSRFToken(token)) {
		csrfTokens.delete(token);
		return true;
	}
	return false;
}

function cleanExpiredCSRFTokens() {
	const now = Date.now();
	for (const [token, timestamp] of csrfTokens.entries()) {
		if (now - timestamp > CSRF_TOKEN_LIFETIME) {
			csrfTokens.delete(token);
		}
	}
}
