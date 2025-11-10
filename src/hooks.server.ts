import { auth } from '$lib/server/auth.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getAuthPath } from '$lib/index.js';
import {
	authPathConfig,
	PROTECTED_ROUTES,
	AUTH_ROUTES,
	DEFAULT_AUTH_REDIRECT
} from '$lib/config/auth-config.js';

export async function handle({ event, resolve }) {
	const { pathname } = event.url;

	// Initialize locals
	event.locals.session = null;
	event.locals.user = null;

	// For non-API routes, set up the session before Better Auth processes
	if (!pathname.startsWith('/api/auth')) {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		}

		const isAuthenticated = !!session?.user;

		// Guard: Redirect authenticated users away from auth pages
		// Allow verify-email page as it handles multiple states
		if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
			if (!pathname.includes('verify-email')) {
				throw redirect(303, DEFAULT_AUTH_REDIRECT);
			}
		}

		// Guard: Redirect unauthenticated users from protected routes
		if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
			// Otherwise redirect to sign-in
			throw redirect(303, getAuthPath('SIGN_IN', authPathConfig));
		}
	}

	// Let Better Auth handle the request
	return svelteKitHandler({ event, resolve, auth, building });
}
