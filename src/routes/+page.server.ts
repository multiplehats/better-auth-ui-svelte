import type { PageServerLoad } from './$types.js';
// import { redirect } from '@sveltejs/kit';
// import { DEFAULT_AUTH_REDIRECT } from '$lib/config/auth-config.js';

export const load = (async ({ locals }) => {
	// Optional: Redirect authenticated users to the app
	// Uncomment if you want the home page to auto-redirect logged-in users
	// if (locals.user) {
	// 	throw redirect(303, DEFAULT_AUTH_REDIRECT);
	// }

	return {
		isAuthenticated: !!locals.user
	};
}) satisfies PageServerLoad;
