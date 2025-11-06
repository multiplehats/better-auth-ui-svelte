import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
import { getSearchParam } from '$lib/utils/utils.js';

export function useOnSuccessTransition({ redirectTo: redirectToProp }: { redirectTo?: string }) {
	const config = getAuthUIConfig();
	const { redirectTo: contextRedirectTo, navigate, hooks, onSessionChange } = config;

	let isPending = $state(false);
	let success = $state(false);

	function getRedirectTo() {
		return redirectToProp || getSearchParam('redirectTo') || contextRedirectTo;
	}

	// Watch for success state change
	$effect(() => {
		if (!success || isPending) return;

		isPending = true;
		navigate(getRedirectTo());
		// In Svelte, we don't have React transitions, but we can track pending state
		// The navigate function will handle the actual navigation
		// Reset after a tick to allow navigation to complete
		setTimeout(() => {
			isPending = false;
		}, 0);
	});

	async function onSuccess() {
		// Refetch session using the hooks provided by better-auth/svelte
		if (hooks?.useSession) {
			const sessionQuery = hooks.useSession();

			await sessionQuery.refetch?.();
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
