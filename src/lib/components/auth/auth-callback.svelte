<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { getSearchParam } from '$lib/utils/utils.js';

	interface Props {
		redirectTo?: string;
	}

	let { redirectTo: redirectToProp }: Props = $props();

	const config = getAuthUIConfig();

	// Track if we're already redirecting to prevent multiple redirects
	let isRedirecting = $state(false);

	// Get redirect URL from props, URL params, or config
	const getRedirectTo = () => {
		return redirectToProp || getSearchParam('redirectTo') || config.redirectTo;
	};

	// Handle the success callback
	const onSuccess = async () => {
		// Refetch session if available
		const sessionHook = config.hooks.useSession();
		if (sessionHook && 'refetch' in sessionHook && typeof sessionHook.refetch === 'function') {
			await sessionHook.refetch?.();
		}

		// Call onSessionChange callback if provided
		if (config.onSessionChange) {
			await config.onSessionChange();
		}

		// Navigate to the redirect URL
		config.navigate(getRedirectTo());
	};

	// Effect to handle the redirect logic
	$effect(() => {
		// Prevent multiple redirects
		if (isRedirecting) return;

		// If no persistClient, redirect immediately
		if (!config.persistClient) {
			isRedirecting = true;
			onSuccess();
			return;
		}

		// Check if we're still restoring (TanStack Query persistence)
		const isRestoring = config.hooks.useIsRestoring?.();

		// Wait for restoration to complete before redirecting
		if (isRestoring) return;

		// Mark as redirecting and execute the success callback
		isRedirecting = true;
		onSuccess();
	});
</script>

<Loader2 class="animate-spin" />
