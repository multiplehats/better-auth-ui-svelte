<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { onMount } from 'svelte';
	import { getAuthClient, getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getLocalizedError } from '$lib/utils/utils.js';

	const authClient = getAuthClient();
	const config = getAuthUIConfig();

	const { onSuccess } = useOnSuccessTransition({
		redirectTo: `${config.basePath}/${config.viewPaths.SIGN_IN}`
	});

	onMount(async () => {
		try {
			await authClient.signOut({ fetchOptions: { throw: true } });
			await onSuccess();
		} catch (error) {
			config.toast.error(getLocalizedError({ error, localization: config.localization }));
		}
	});
</script>

<Loader2 class="animate-spin" />
