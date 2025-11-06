import type { AnyAuthClient } from './any-auth-client.js';
import type { SocialProvider } from 'better-auth/social-providers';

export type SocialOptions = {
	/**
	 * Array of Social Providers to enable
	 * @remarks `SocialProvider[]`
	 */
	providers: SocialProvider[];
	/**
	 * Custom social sign in function
	 */
	signIn?: (params: Parameters<AnyAuthClient['signIn']['social']>[0]) => Promise<unknown>;
};
