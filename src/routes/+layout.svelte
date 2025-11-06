<script lang="ts">
	import '../app.css';
	import { AuthUIProvider } from '$lib/index.js';
	import type { LayoutProps } from './$types.js';
	import { toast, Toaster } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client.js';
	import { ModeWatcher } from 'mode-watcher';
	import { authPathConfig } from '$lib/config/auth-config.js';

	let { children }: LayoutProps = $props();
</script>

<Toaster />
<ModeWatcher />

<AuthUIProvider
	{authClient}
	basePath={authPathConfig.basePath}
	viewPaths={authPathConfig.viewPaths}
	magicLink={true}
	{toast}
>
	{@render children()}
</AuthUIProvider>
