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
	adminClient
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';

/**
 * Better Auth Svelte client
 * This provides reactive stores for authentication state
 */
export const authClient = createAuthClient({
	plugins: [
		organizationClient(),
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
		lastLoginMethodClient(),
		adminClient()
	]
});

// Export convenience methods
export const useSession = authClient.useSession;
