<script lang="ts">
	import { onMount } from 'svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';

	interface Props {
		captchaRef?: unknown;
	}

	let { captchaRef = $bindable() }: Props = $props();

	const config = getAuthUIConfig();
	const { captcha } = config;

	onMount(() => {
		// Set global recaptcha options
		if (typeof window !== 'undefined') {
			(window as unknown as Record<string, unknown>).recaptchaOptions = {
				useRecaptchaNet: captcha?.recaptchaNet,
				enterprise: captcha?.enterprise
			};
		}
	});
</script>

{#if captcha}
	<style>
		.grecaptcha-badge {
			border-radius: var(--radius) !important;
			--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
			box-shadow:
				var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
				var(--tw-ring-shadow), var(--tw-shadow) !important;
			border-style: var(--tw-border-style) !important;
			border-width: 1px;
		}

		:global(.dark .grecaptcha-badge) {
			border-color: var(--input) !important;
		}
	</style>

	<!-- {#await import('svelte-google-recaptcha') then { ReCAPTCHA }}
		<ReCAPTCHA
			bind:this={captchaRef}
			sitekey={captcha.siteKey}
			theme={theme}
			hl={lang}
			size={captcha.provider === 'google-recaptcha-v2-invisible' ? 'invisible' : 'normal'}
			class={cn(
				captcha.provider === 'google-recaptcha-v2-invisible'
					? 'absolute'
					: 'mx-auto h-[76px] w-[302px] overflow-hidden rounded bg-muted'
			)}
		/>
	{/await} -->
{/if}
