import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginPage = url.pathname === '/login';

	return {
		isAuthenticated: locals.isAuthenticated,
		isLoginPage
	};
};
