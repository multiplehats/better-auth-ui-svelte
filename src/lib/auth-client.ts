import { createAuthClient } from 'better-auth/svelte';
import {
	organizationClient,
	apiKeyClient,
	twoFactorClient,
	usernameClient,
	magicLinkClient,
	emailOTPClient,
	lastLoginMethodClient,
	oneTapClient,
	genericOAuthClient,
	anonymousClient,
	multiSessionClient,
	passkeyClient
} from 'better-auth/client/plugins';

/**
 * Better Auth Svelte client
 * This provides reactive stores for authentication state
 */
export const authClient = createAuthClient({
	plugins: [
		apiKeyClient(),
		multiSessionClient(),
		passkeyClient(),
		oneTapClient({
			clientId: ''
		}),
		genericOAuthClient(),
		anonymousClient(),
		usernameClient(),
		magicLinkClient(),
		emailOTPClient(),
		twoFactorClient(),
		organizationClient(),
		lastLoginMethodClient()
	]
});

// Export convenience methods
export const { useSession } = authClient;
