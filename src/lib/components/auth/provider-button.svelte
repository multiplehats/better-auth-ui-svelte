<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAuthClient, getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import { getLocalizedError, getSearchParam } from '$lib/utils/utils.js';
	import type { Provider } from '$lib/lib/social-providers.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SocialProvider } from 'better-auth/social-providers';
	import type { AuthViewClassNames } from './auth-view.svelte';

	interface Props {
		className?: string;
		classNames?: AuthViewClassNames;
		callbackURL?: string;
		isSubmitting: boolean;
		localization: Partial<AuthLocalization>;
		other?: boolean;
		provider: Provider;
		redirectTo?: string;
		socialLayout: 'auto' | 'horizontal' | 'grid' | 'vertical';
		setIsSubmitting: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		callbackURL: callbackURLProp,
		isSubmitting,
		localization,
		other,
		provider,
		redirectTo: redirectToProp,
		socialLayout,
		setIsSubmitting
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();

	function getRedirectTo() {
		return redirectToProp || getSearchParam('redirectTo') || config.redirectTo;
	}

	function getCallbackURL() {
		const baseURL = config.baseURL || window.location.origin;
		return `${baseURL}${
			callbackURLProp ||
			(config.persistClient
				? `${config.basePath}/${config.viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(getRedirectTo())}`
				: getRedirectTo())
		}`;
	}

	async function doSignInSocial() {
		setIsSubmitting(true);

		try {
			if (other) {
				// Generic OAuth
				const oauth2Params = {
					providerId: provider.provider,
					callbackURL: getCallbackURL(),
					fetchOptions: { throw: true }
				};

				if (config.genericOAuth?.signIn) {
					await config.genericOAuth.signIn(oauth2Params);

					setTimeout(() => {
						setIsSubmitting(false);
					}, 10000);
				} else {
					await authClient.signIn.oauth2(oauth2Params);
				}
			} else {
				// Social provider
				const socialParams = {
					provider: provider.provider as SocialProvider,
					callbackURL: getCallbackURL(),
					fetchOptions: { throw: true }
				};

				if (config.social?.signIn) {
					await config.social.signIn(socialParams);

					setTimeout(() => {
						setIsSubmitting(false);
					}, 10000);
				} else {
					await authClient.signIn.social(socialParams);
				}
			}
		} catch (error) {
			config.toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});

			setIsSubmitting(false);
		}
	}
</script>

<Button
	class={cn(
		socialLayout === 'vertical' ? 'w-full' : 'grow',
		className,
		classNames?.form?.button,
		classNames?.form?.outlineButton,
		classNames?.form?.providerButton
	)}
	disabled={isSubmitting}
	variant="outline"
	onclick={doSignInSocial}
>
	{#if provider.icon}
		<provider.icon class={classNames?.form?.icon} />
	{/if}

	{#if socialLayout === 'grid'}
		{provider.name}
	{/if}
	{#if socialLayout === 'vertical'}
		{localization.SIGN_IN_WITH} {provider.name}
	{/if}
</Button>
