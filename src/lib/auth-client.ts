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
	multiSessionClient
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';

/**
 * Better Auth Svelte client
 * This provides reactive stores for authentication state
 */
export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
	plugins: [
		apiKeyClient(),
		multiSessionClient(),
		passkeyClient(),
		// @ts-expect-error - BetterAuthClientPlugin type incompatibility between better-auth versions.
		// The oneTapClient plugin has a slightly different type signature that doesn't match the expected
		// BetterAuthClientPlugin interface, but it works correctly at runtime.
		oneTapClient({
			clientId: ''
		}),
		genericOAuthClient(),
		anonymousClient(),
		usernameClient(),
		magicLinkClient(),
		emailOTPClient(),
		twoFactorClient(),
		// @ts-expect-error - BetterAuthClientPlugin type incompatibility between better-auth versions.
		// The organizationClient plugin has a slightly different type signature that doesn't match the expected
		// BetterAuthClientPlugin interface, but it works correctly at runtime.
		organizationClient(),
		lastLoginMethodClient()
	]
});

// Export convenience methods
export const useSession = authClient.useSession;
