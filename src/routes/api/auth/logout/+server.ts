import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Delete session and CSRF cookies
	cookies.delete('session', { path: '/' });
	cookies.delete('csrf_token', { path: '/' });

	return json({ success: true });
};
