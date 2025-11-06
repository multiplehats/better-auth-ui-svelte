import {
	authViewPaths,
	accountViewPaths,
	organizationViewPaths,
	type AuthViewPath,
	type AccountViewPath,
	type OrganizationViewPath
} from './view-paths.js';
import type { AuthViewPaths, AccountViewPaths, OrganizationViewPaths } from './view-paths.js';

/**
 * Configuration for path generation
 */
export interface PathConfig {
	/**
	 * Base path for auth views
	 * @default "/auth"
	 */
	basePath?: string;
	/**
	 * Base URL for generating full URLs (optional)
	 * @example "https://example.com"
	 */
	baseURL?: string;
	/**
	 * Custom view paths (merged with defaults)
	 */
	viewPaths?: Partial<AuthViewPaths>;
}

export interface AccountPathConfig {
	/**
	 * Base path for account views
	 * @default "/account"
	 */
	basePath?: string;
	/**
	 * Base URL for generating full URLs (optional)
	 */
	baseURL?: string;
	/**
	 * Custom view paths (merged with defaults)
	 */
	viewPaths?: Partial<AccountViewPaths>;
}

export interface OrganizationPathConfig {
	/**
	 * Base path for organization views
	 * @default "/organization"
	 */
	basePath?: string;
	/**
	 * Base URL for generating full URLs (optional)
	 */
	baseURL?: string;
	/**
	 * Custom view paths (merged with defaults)
	 */
	viewPaths?: Partial<OrganizationViewPaths>;
}

// Default configurations
const DEFAULT_AUTH_BASE_PATH = '/auth';
const DEFAULT_ACCOUNT_BASE_PATH = '/account';
const DEFAULT_ORGANIZATION_BASE_PATH = '/organization';

/**
 * Get the full path for an auth view
 *
 * @example
 * ```ts
 * // With defaults
 * getAuthPath('SIGN_IN') // '/auth/sign-in'
 *
 * // With custom base path
 * getAuthPath('SIGN_IN', { basePath: '/authentication' }) // '/authentication/sign-in'
 *
 * // With custom view paths
 * getAuthPath('SIGN_IN', {
 *   viewPaths: { SIGN_IN: 'login' }
 * }) // '/auth/login'
 * ```
 */
export function getAuthPath(view: AuthViewPath, config: PathConfig = {}): string {
	const basePath = config.basePath ?? DEFAULT_AUTH_BASE_PATH;
	const viewPaths = { ...authViewPaths, ...config.viewPaths };
	const viewPath = viewPaths[view];

	// Normalize paths (remove trailing/leading slashes)
	const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
	const normalizedView = viewPath.replace(/^\//, '');

	return `${normalizedBase}/${normalizedView}`;
}

/**
 * Get the full URL for an auth view (includes baseURL)
 *
 * @example
 * ```ts
 * getAuthUrl('SIGN_IN', {
 *   baseURL: 'https://example.com'
 * }) // 'https://example.com/auth/sign-in'
 * ```
 */
export function getAuthUrl(view: AuthViewPath, config: PathConfig = {}): string {
	const path = getAuthPath(view, config);
	const baseURL = config.baseURL?.replace(/\/$/, '') ?? '';
	return baseURL ? `${baseURL}${path}` : path;
}

/**
 * Get the full path for an account view
 *
 * @example
 * ```ts
 * getAccountPath('SETTINGS') // '/account/settings'
 * ```
 */
export function getAccountPath(view: AccountViewPath, config: AccountPathConfig = {}): string {
	const basePath = config.basePath ?? DEFAULT_ACCOUNT_BASE_PATH;
	const viewPaths = { ...accountViewPaths, ...config.viewPaths };
	const viewPath = viewPaths[view];

	const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
	const normalizedView = viewPath.replace(/^\//, '');

	return `${normalizedBase}/${normalizedView}`;
}

/**
 * Get the full URL for an account view (includes baseURL)
 *
 * @example
 * ```ts
 * getAccountUrl('SETTINGS', {
 *   baseURL: 'https://example.com'
 * }) // 'https://example.com/account/settings'
 * ```
 */
export function getAccountUrl(view: AccountViewPath, config: AccountPathConfig = {}): string {
	const path = getAccountPath(view, config);
	const baseURL = config.baseURL?.replace(/\/$/, '') ?? '';
	return baseURL ? `${baseURL}${path}` : path;
}

/**
 * Get the full path for an organization view
 *
 * @example
 * ```ts
 * getOrganizationPath('MEMBERS') // '/organization/members'
 * ```
 */
export function getOrganizationPath(
	view: OrganizationViewPath,
	config: OrganizationPathConfig = {}
): string {
	const basePath = config.basePath ?? DEFAULT_ORGANIZATION_BASE_PATH;
	const viewPaths = { ...organizationViewPaths, ...config.viewPaths };
	const viewPath = viewPaths[view];

	const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
	const normalizedView = viewPath.replace(/^\//, '');

	return `${normalizedBase}/${normalizedView}`;
}

/**
 * Get the full URL for an organization view (includes baseURL)
 *
 * @example
 * ```ts
 * getOrganizationUrl('MEMBERS', {
 *   baseURL: 'https://example.com'
 * }) // 'https://example.com/organization/members'
 * ```
 */
export function getOrganizationUrl(
	view: OrganizationViewPath,
	config: OrganizationPathConfig = {}
): string {
	const path = getOrganizationPath(view, config);
	const baseURL = config.baseURL?.replace(/\/$/, '') ?? '';
	return baseURL ? `${baseURL}${path}` : path;
}

/**
 * Helper to get all auth paths as an object
 *
 * @example
 * ```ts
 * const paths = getAllAuthPaths();
 * // {
 * //   SIGN_IN: '/auth/sign-in',
 * //   SIGN_UP: '/auth/sign-up',
 * //   ...
 * // }
 * ```
 */
export function getAllAuthPaths(config: PathConfig = {}): Record<AuthViewPath, string> {
	return Object.keys(authViewPaths).reduce(
		(acc, key) => {
			acc[key as AuthViewPath] = getAuthPath(key as AuthViewPath, config);
			return acc;
		},
		{} as Record<AuthViewPath, string>
	);
}

/**
 * Helper to get all account paths as an object
 */
export function getAllAccountPaths(
	config: AccountPathConfig = {}
): Record<AccountViewPath, string> {
	return Object.keys(accountViewPaths).reduce(
		(acc, key) => {
			acc[key as AccountViewPath] = getAccountPath(key as AccountViewPath, config);
			return acc;
		},
		{} as Record<AccountViewPath, string>
	);
}

/**
 * Helper to get all organization paths as an object
 */
export function getAllOrganizationPaths(
	config: OrganizationPathConfig = {}
): Record<OrganizationViewPath, string> {
	return Object.keys(organizationViewPaths).reduce(
		(acc, key) => {
			acc[key as OrganizationViewPath] = getOrganizationPath(
				key as OrganizationViewPath,
				config
			);
			return acc;
		},
		{} as Record<OrganizationViewPath, string>
	);
}
