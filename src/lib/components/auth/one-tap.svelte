<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { getLocalizedError } from '$lib/utils/utils.js';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';

	interface Props {
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
	}

	let { localization: localizationProp, redirectTo }: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	// Merge localization props with context localization
	const localization = $derived({ ...contextLocalization, ...localizationProp });

	// Use the success transition hook to handle session refetch and navigation
	// svelte-ignore state_referenced_locally -- redirect value is captured once for transition hook
	const { onSuccess } = useOnSuccessTransition({ redirectTo });

	let oneTapFetched = $state(false);

	onMount(() => {
		if (oneTapFetched) return;
		oneTapFetched = true;

		try {
			authClient.oneTap({
				fetchOptions: {
					throw: true,
					onSuccess
				}
			});
		} catch (error) {
			config.toast.error(getLocalizedError({ error, localization }));
		}
	});
</script>

<!-- OneTap renders nothing - it's handled by Google's SDK -->
