<script lang="ts">
	import AuthView from '$lib/components/auth/auth-view.svelte';
	import type { PageProps } from './$types.js';

	let { data, params }: PageProps = $props();
</script>

<AuthView path={params.path} />
