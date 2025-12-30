<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte.js';
	import { useLang } from '$lib/hooks/use-lang.svelte.js';
	import { useTheme } from '$lib/hooks/use-theme.svelte.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const config = getAuthUIConfig();
	const captcha = config.captcha;
	const hydratedStore = useIsHydrated();
	const isHydrated = $derived(hydratedStore.value);
	const themeStore = useTheme();
	const theme = $derived(themeStore.theme);
	const langStore = useLang();
	const lang = $derived(langStore.lang);

	// Don't render if not using recaptcha v3
	const shouldRender = $derived(captcha?.provider === 'google-recaptcha-v3');

	// Load recaptcha script
	onMount(() => {
		if (captcha?.provider !== 'google-recaptcha-v3') return;

		const script = document.createElement('script');
		const baseUrl = captcha.recaptchaNet
			? 'https://www.recaptcha.net/recaptcha/api.js'
			: 'https://www.google.com/recaptcha/api.js';
		const url = new URL(baseUrl);
		url.searchParams.set('render', captcha.siteKey);
		if (captcha.enterprise) {
			url.searchParams.set('onload', 'onRecaptchaLoadCallback');
			url.searchParams.set('render', 'explicit');
		}
		script.src = url.toString();
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		return () => {
			// Cleanup script on unmount
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	});

	// Update recaptcha iframe theme and language
	$effect(() => {
		if (captcha?.provider !== 'google-recaptcha-v3') return;

		const updateRecaptcha = () => {
			// find iframe with title "reCAPTCHA"
			const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement;
			if (iframe) {
				const iframeSrcUrl = new URL(iframe.src);
				iframeSrcUrl.searchParams.set('theme', theme);
				if (lang) iframeSrcUrl.searchParams.set('hl', lang);
				iframe.src = iframeSrcUrl.toString();
			}
		};

		updateRecaptcha();
	});
</script>

<svelte:head>
	{#if shouldRender && isHydrated}
		<style>
			.grecaptcha-badge {
				visibility: hidden;
				border-radius: var(--radius) !important;
				--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
				box-shadow:
					var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
					var(--tw-ring-shadow), var(--tw-shadow) !important;
				border-style: var(--tw-border-style) !important;
				border-width: 1px;
			}

			.dark .grecaptcha-badge {
				border-color: var(--input) !important;
			}
		</style>
	{/if}
</svelte:head>

{@render children()}
