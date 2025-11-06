import { createAuthClient } from 'better-auth/svelte';
import {
	organizationClient,
	apiKeyClient,
	oneTimeTokenClient,
	twoFactorClient,
	usernameClient,
	magicLinkClient,
	emailOTPClient,
	lastLoginMethodClient,
	multiSessionClient
} from 'better-auth/client/plugins';

/**
 * Better Auth Svelte client
 * This provides reactive stores for authentication state
 */
export const authClient = createAuthClient({
	plugins: [
		organizationClient({
			teams: {
				enabled: true
			}
		}),
		apiKeyClient(),
		oneTimeTokenClient(),
		twoFactorClient(),
		usernameClient(),
		magicLinkClient(),
		emailOTPClient(),
		lastLoginMethodClient(),
		multiSessionClient()
	]
});

// Export convenience methods
export const { useSession } = authClient;
