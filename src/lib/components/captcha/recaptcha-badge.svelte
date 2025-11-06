<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';

	interface Props {
		class?: string;
		localization?: Partial<AuthLocalization>;
	}

	let { class: className, localization: propLocalization }: Props = $props();

	const isHydrated = useIsHydrated();
	const config = getAuthUIConfig();
	const { captcha } = config;
	const contextLocalization = getLocalization();
	const localization = { ...contextLocalization, ...propLocalization };
</script>

{#if captcha}
	{#if !captcha.hideBadge}
		{#if isHydrated.value}
			<style>
				.grecaptcha-badge {
					visibility: visible !important;
				}
			</style>
		{/if}
	{:else}
		<style>
			.grecaptcha-badge {
				visibility: hidden;
			}
		</style>

		<p class={cn('text-xs text-muted-foreground', className)}>
			{localization.PROTECTED_BY_RECAPTCHA}
			{localization.BY_CONTINUING_YOU_AGREE} Google
			<a
				class="text-foreground hover:underline"
				href="https://policies.google.com/privacy"
				target="_blank"
				rel="noreferrer"
			>
				{localization.PRIVACY_POLICY}
			</a>
			&
			<a
				class="text-foreground hover:underline"
				href="https://policies.google.com/terms"
				target="_blank"
				rel="noreferrer"
			>
				{localization.TERMS_OF_SERVICE}
			</a>.
		</p>
	{/if}
{/if}
