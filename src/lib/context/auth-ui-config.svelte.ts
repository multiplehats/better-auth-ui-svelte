import { getContext, setContext } from 'svelte';
import type { AnyAuthClient, AuthUIConfig } from '../types/index.js';
import { authLocalization } from '../localization/auth-localization.js';

const AUTH_UI_CONFIG_KEY = Symbol('auth-ui-config');

/**
 * Set the Auth UI configuration context
 * This should be called in the AuthUIProvider component
 */
export function setAuthUIConfig(config: AuthUIConfig) {
	if (!config.authClient) {
		throw new Error('authClient is required in AuthUIProvider');
	}
	setContext(AUTH_UI_CONFIG_KEY, config);
}

/**
 * Get the Auth UI configuration from context
 * Returns default values if not set
 */
export function getAuthUIConfig(): AuthUIConfig {
	const config = getContext<AuthUIConfig | undefined>(AUTH_UI_CONFIG_KEY);
	if (!config) {
		throw new Error(
			'AuthUIProvider context not found. Make sure to wrap your app with <AuthUIProvider>'
		);
	}
	return config;
}

/**
 * Get a localized string from context
 */
export function getLocalization() {
	const config = getAuthUIConfig();
	return { ...authLocalization, ...config.localization };
}

/**
 * Get the auth client from context
 * IMPORTANT: authClient must be passed to AuthUIProvider by the consuming app
 */
export function getAuthClient<KeysToOmit extends keyof AnyAuthClient = never>(): Omit<
	AnyAuthClient,
	KeysToOmit
> {
	const config = getAuthUIConfig();
	return config.authClient;
}
