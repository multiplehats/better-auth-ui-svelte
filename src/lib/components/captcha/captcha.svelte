<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { useTheme } from '$lib/hooks/use-theme.svelte';
	import type { AuthLocalization } from '$lib/types/index.js';
	import RecaptchaBadge from './recaptcha-badge.svelte';
	import RecaptchaV2 from './recaptcha-v2.svelte';

	// Default captcha endpoints
	const DEFAULT_CAPTCHA_ENDPOINTS = ['/sign-up/email', '/sign-in/email', '/forget-password'];

	interface Props {
		ref?: any;
		localization?: Partial<AuthLocalization>;
		action?: string; // Optional action to check if it's in the endpoints list
	}

	let { ref = $bindable(), localization, action }: Props = $props();

	const config = getAuthUIConfig();
	const { captcha } = config;
	const { theme } = useTheme();

	// If action is provided, check if it's in the list of captcha-enabled endpoints
	const shouldShowCaptcha = $derived(() => {
		if (!captcha) return false;
		if (!action) return true;

		const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS;
		return endpoints.includes(action);
	});

	const showRecaptchaV2 = $derived(
		captcha?.provider === 'google-recaptcha-v2-checkbox' ||
			captcha?.provider === 'google-recaptcha-v2-invisible'
	);

	const showRecaptchaBadge = $derived(
		captcha?.provider === 'google-recaptcha-v3' ||
			captcha?.provider === 'google-recaptcha-v2-invisible'
	);

	const showTurnstile = $derived(captcha?.provider === 'cloudflare-turnstile');

	const showHCaptcha = $derived(captcha?.provider === 'hcaptcha');
</script>

{#if captcha && shouldShowCaptcha()}
	{#if showRecaptchaV2}
		<RecaptchaV2 bind:captchaRef={ref} />
	{/if}

	{#if showRecaptchaBadge}
		<RecaptchaBadge {localization} />
	{/if}

	{#if showTurnstile}
		{#await import('@marsidev/svelte-turnstile') then { Turnstile }}
			<div class="mx-auto">
				<Turnstile
					bind:ref
					siteKey={captcha.siteKey}
					options={{
						theme: theme,
						size: 'flexible'
					}}
				/>
			</div>
		{/await}
	{/if}

	{#if showHCaptcha}
		{#await import('@hcaptcha/svelte-hcaptcha') then { HCaptcha }}
			<div class="mx-auto">
				<HCaptcha bind:captchaRef={ref} sitekey={captcha.siteKey} {theme} />
			</div>
		{/await}
	{/if}
{/if}
