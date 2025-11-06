import type { PathConfig } from '$lib/utils/get-paths.js';

/**
 * Shared authentication configuration
 * Used by both the AuthUIProvider and server-side redirects
 */
export const authPathConfig: PathConfig = {
	basePath: '/auth'
	// Add custom viewPaths here if needed
	// viewPaths: {
	//   SIGN_IN: 'login',
	//   SIGN_UP: 'register',
	// }
};

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = ['/app'];

/**
 * Auth routes that should redirect to app if already authenticated
 */
export const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up'];

/**
 * Default redirect after successful authentication
 */
export const DEFAULT_AUTH_REDIRECT = '/app';

/**
 * Home page path
 */
export const HOME_PATH = '/';
