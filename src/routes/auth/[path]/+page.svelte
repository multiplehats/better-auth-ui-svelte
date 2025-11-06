<script lang="ts">
	import AuthView from '$lib/components/auth/auth-view.svelte';
	import type { PageProps } from './$types.js';

	let { data, params }: PageProps = $props();
</script>

<AuthView
	path={params.path}
	callbackURL="/app"
	classNames={{
		base: 'border-none shadow-none bg-transparent',
		title: 'md:text-2xl font-semibold',
		description: 'md:text-base text-muted-foreground'
	}}
/>
