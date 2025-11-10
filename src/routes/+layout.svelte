<script lang="ts">
	import '../app.css';
	import { AuthUIProvider } from '$lib/index.js';
	import type { LayoutProps } from './$types.js';
	import { toast, Toaster } from 'svelte-sonner';
	import { authClient } from '$lib/auth-client.js';
	import { ModeWatcher } from 'mode-watcher';
	import { authPathConfig, accountConfig, DEFAULT_AUTH_REDIRECT } from '$lib/config/auth-config.js';

	let { children }: LayoutProps = $props();
</script>

<Toaster />
<ModeWatcher />

<AuthUIProvider
	{authClient}
	gravatar={true}
	redirectTo={DEFAULT_AUTH_REDIRECT}
	basePath={authPathConfig.basePath}
	viewPaths={authPathConfig.viewPaths}
	account={accountConfig}
	emailVerification={{
		resendCooldown: 60,
		redirectToVerifyPage: true // Since autoSignInAfterVerification is false in auth.ts
	}}
	organization={{
		pathMode: 'default',
		basePath: '/app/organization'
	}}
	multiSession={true}
	social={{
		providers: ['google']
	}}
	magicLink={{
		resendCooldown: 60,
		redirectToSentPage: true
	}}
	{toast}
>
	{@render children()}
</AuthUIProvider>
