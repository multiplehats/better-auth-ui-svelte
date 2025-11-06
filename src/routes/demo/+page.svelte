<script lang="ts">
	import { authViewPaths } from '$lib/index.js';
	import type { PageProps } from './$types.js';

	let { data }: PageProps = $props();
</script>

{#each Object.entries(authViewPaths) as [key, path]}
	<p>{key}: <a href="/demo/auth/{path}">/demo/auth/{path}</a></p>
{/each}
