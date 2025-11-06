<script lang="ts">
	import { AuthUIProvider } from '$lib/index.js';
	import type { LayoutProps } from './$types.js';
	import { Toaster } from 'svelte-sonner';
	import Header from './_components/header.svelte';
	import { authClient } from '$lib/auth-client.js';

	let { data, children }: LayoutProps = $props();
</script>

<Toaster />

<AuthUIProvider {authClient}>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
		<Header />

		<main class="container mx-auto px-4 py-8">
			{@render children()}
		</main>
	</div>
</AuthUIProvider>
