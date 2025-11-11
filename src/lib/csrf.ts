/**
 * CSRF Token utilities for client-side
 */

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(): string | null {
	if (typeof document === 'undefined') return null;

	const cookies = document.cookie.split(';');
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'csrf_token') {
			return decodeURIComponent(value);
		}
	}
	return null;
}

/**
 * Create headers with CSRF token
 */
export function headersWithCSRF(additionalHeaders: Record<string, string> = {}): HeadersInit {
	const csrfToken = getCSRFToken();
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...additionalHeaders
	};

	if (csrfToken) {
		headers['X-CSRF-Token'] = csrfToken;
	}

	return headers;
}
