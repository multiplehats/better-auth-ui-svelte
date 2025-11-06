<script lang="ts">
	import SignedIn from '$lib/components/signed-in.svelte';
	import { authViewPaths } from '$lib/index.js';
	import type { PageProps } from './$types.js';

	let { data }: PageProps = $props();
</script>

{#each Object.entries(authViewPaths) as [key, path]}
	<p>{key}: <a href="/demo/auth/{path}">/demo/auth/{path}</a></p>
{/each}

<SignedIn>
	<p>
		You are signed in! Go to <a href="/demo/auth/sign-out">sign out</a> page to test sign out view.
	</p>
</SignedIn>
