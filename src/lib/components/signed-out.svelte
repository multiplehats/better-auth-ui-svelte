<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getAuthClient } from '$lib/context/auth-ui-config.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const authClient = getAuthClient();
	const session = authClient.useSession();
</script>

{#if !$session.data && !$session.isPending}
	{@render children()}
{/if}
