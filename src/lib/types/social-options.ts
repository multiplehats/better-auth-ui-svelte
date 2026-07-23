import type { AnyAuthClient } from './any-auth-client.js';
import type { Provider } from '../social-providers.js';

export type SocialOptions = {
	/**
	 * Array of Social Providers to enable
	 * @remarks `Provider[]`
	 */
	providers: Provider[];
	/**
	 * Custom social sign in function
	 */
	signIn?: (params: Parameters<AnyAuthClient['signIn']['social']>[0]) => Promise<unknown>;
};
