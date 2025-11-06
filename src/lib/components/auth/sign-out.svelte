<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { onMount } from 'svelte';
	import { getAuthClient, getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';

	const authClient = getAuthClient();
	const config = getAuthUIConfig();

	const { onSuccess } = useOnSuccessTransition({
		redirectTo: `${config.basePath}/${config.viewPaths.SIGN_IN}`
	});

	let signingOut = $state(false);

	onMount(() => {
		if (signingOut) return;
		signingOut = true;

		authClient.signOut().finally(onSuccess);
	});
</script>

<Loader2 class="animate-spin" />
