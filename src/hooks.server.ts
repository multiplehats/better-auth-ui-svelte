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
	event.locals.session = null;
	event.locals.user = null;

	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const { pathname } = event.url;
	const isAuthenticated = !!session?.user;

	// Redirect authenticated users away from auth pages (sign-in, sign-up)
	// if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
	// 	throw redirect(303, DEFAULT_AUTH_REDIRECT);
	// }

	// Redirect unauthenticated users from protected routes
	if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
		throw redirect(303, getAuthPath('SIGN_IN', authPathConfig));
	}

	return svelteKitHandler({ event, resolve, auth, building });
}
