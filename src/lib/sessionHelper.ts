/**
 * Session helper utilities for handling session expiration
 */

import { goto } from '$app/navigation';
import { browser } from '$app/environment';

/**
 * Check if response indicates session expiration
 */
export function isSessionExpired(response: Response): boolean {
	return response.status === 401 ||
	       (response.status === 403 && response.headers.get('X-Session-Expired') === 'true');
}

/**
 * Clear all session-related cookies
 */
export function clearSession(): void {
	if (!browser) return;

	// Clear session cookie
	document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

	// Clear CSRF token cookie
	document.cookie = 'csrf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
}

/**
 * Handle session expiration by clearing session and redirecting to login
 */
export async function handleSessionExpiration(message?: string): Promise<void> {
	if (!browser) return;

	clearSession();

	// Store message in sessionStorage to show on login page
	if (message) {
		sessionStorage.setItem('session_expired_message', message);
	}

	// Redirect to login
	await goto('/login', { replaceState: true });
}

/**
 * Wrapper for fetch that automatically handles session expiration
 */
export async function fetchWithSessionCheck(
	url: string,
	options?: RequestInit
): Promise<Response> {
	const response = await fetch(url, options);

	if (isSessionExpired(response)) {
		await handleSessionExpiration('Your session has expired. Please log in again.');
		throw new Error('Session expired');
	}

	return response;
}

/**
 * Update CSRF token from response
 */
export function updateCSRFToken(data: any): void {
	if (!browser) return;

	if (data.csrfToken) {
		document.cookie = `csrf_token=${encodeURIComponent(data.csrfToken)}; path=/; max-age=3600; SameSite=Strict`;
	}
}
