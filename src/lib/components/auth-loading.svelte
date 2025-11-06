<script lang="ts">
	import { getAuthClient } from '$lib/context/auth-ui-config.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const authClient = getAuthClient();
	const session = authClient.useSession();

	let isPending = $derived($session.isPending);
</script>

{#if isPending}
	{@render children()}
{/if}
