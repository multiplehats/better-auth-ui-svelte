import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
import { getSearchParam } from '$lib/utils/utils.js';

export function useOnSuccessTransition({
	redirectTo: redirectToProp
}: {
	redirectTo?: string | (() => string | undefined);
}) {
	const config = getAuthUIConfig();
	const { redirectTo: contextRedirectTo, navigate, hooks, onSessionChange } = config;

	let isPending = $state(false);
	let success = $state(false);

	function getRedirectTo() {
		const rd = typeof redirectToProp === 'function' ? redirectToProp() : redirectToProp;
		return rd || getSearchParam('redirectTo') || contextRedirectTo;
	}

	// Watch for success state change
	$effect(() => {
		if (!success || isPending) return;

		isPending = true;
		navigate(getRedirectTo());
	});

	async function onSuccess() {
		// Refetch session using the hooks provided by better-auth/svelte.
		// `hooks.useSession()` returns a nanostore atom; the session data and
		// `refetch` live on its *value* (accessed via `.get()`), not on the
		// atom object itself. Without this refetch, navigating to a page
		// guarded by `useAuthenticate` (e.g. accept-invitation) after a 2FA
		// verify bounces back to sign-in — the atom still holds the stale
		// pre-2FA state (`data: null`) because `verify-otp` isn't in
		// better-auth's `atomListeners` matcher list.
		if (hooks?.useSession) {
			const sessionAtom = hooks.useSession();
			const sessionValue =
				sessionAtom && typeof sessionAtom.get === 'function' ? sessionAtom.get() : null;
			const refetch = sessionValue?.refetch;
			if (typeof refetch === 'function') {
				await refetch();
			}
		}

		success = true;

		if (onSessionChange) {
			isPending = true;
			await onSessionChange();
			isPending = false;
		}
	}

	return {
		onSuccess,
		get isPending() {
			return isPending;
		}
	};
}
