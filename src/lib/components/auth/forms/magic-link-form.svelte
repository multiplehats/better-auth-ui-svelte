<script lang="ts">
	import type { BetterFetchOption } from '@better-fetch/fetch';
	import { Loader2 } from '@lucide/svelte';
	import { z } from 'zod';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getSearchParam } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import Captcha from '$lib/components/captcha/captcha.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		callbackURL?: string;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		callbackURL: callbackURLProp,
		isSubmitting: isSubmittingProp,
		localization: localizationProp,
		redirectTo: redirectToProp,
		setIsSubmitting
	}: Props = $props();

	const isHydrated = useIsHydrated();
	const captchaHook = useCaptcha({
		localization: localizationProp
	});
	const { getCaptchaHeaders, resetCaptcha } = captchaHook;

	// Local state for captcha binding
	let captchaRef = $state<any>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	const config = getAuthUIConfig();
	const {
		authClient,
		basePath,
		baseURL,
		persistClient,
		localization: contextLocalization,
		redirectTo: contextRedirectTo,
		viewPaths,
		toast
	} = config;

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const getRedirectTo = () =>
		redirectToProp || getSearchParam('redirectTo') || contextRedirectTo || '';

	const getCallbackURL = () =>
		`${baseURL || (typeof window !== 'undefined' ? window.location.origin : '')}${
			callbackURLProp ||
			(persistClient
				? `${basePath || '/auth'}/${viewPaths?.CALLBACK || 'callback'}?redirectTo=${encodeURIComponent(getRedirectTo())}`
				: getRedirectTo())
		}`;

	// Form schema
	const formSchema = $derived(
		z.object({
			email: z.email({
				error: `${localization.EMAIL} ${localization.IS_INVALID}`
			})
		})
	);

	// Form state
	let email = $state('');
	let formSubmitting = $state(false);
	let errors = $state<Record<string, string | undefined>>({});

	const isSubmitting = $derived(isSubmittingProp || formSubmitting);

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(formSubmitting);
	});

	async function sendMagicLink(event: Event) {
		event.preventDefault();

		// Validate form
		const result = formSchema.safeParse({ email });

		if (!result.success) {
			errors = {};
			result.error.issues.forEach((err) => {
				if (err.path[0]) {
					errors[err.path[0] as string] = err.message;
				}
			});
			return;
		}

		formSubmitting = true;
		errors = {};

		try {
			const fetchOptions: BetterFetchOption = {
				throw: true,
				headers: await getCaptchaHeaders('/sign-in/magic-link')
			};

			await authClient.signIn.magicLink({
				email,
				callbackURL: getCallbackURL(),
				fetchOptions
			});

			toast({
				variant: 'success',
				message: localization.MAGIC_LINK_EMAIL || 'Magic link sent to your email'
			});

			// Reset form
			email = '';
		} catch (error) {
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});
			resetCaptcha();
		} finally {
			formSubmitting = false;
		}
	}
</script>

<form
	onsubmit={sendMagicLink}
	novalidate={isHydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<div class="space-y-2">
		<Label for="email" class={classNames?.label}>
			{localization.EMAIL}
		</Label>

		<Input
			id="email"
			name="email"
			autocomplete="email"
			class={classNames?.input}
			type="email"
			placeholder={localization.EMAIL_PLACEHOLDER}
			disabled={isSubmitting}
			bind:value={email}
		/>

		{#if errors.email}
			<p class={cn('text-sm text-destructive', classNames?.error)}>{errors.email}</p>
		{/if}
	</div>

	<Captcha bind:captchaRef {localization} action="/sign-in/magic-link" />

	<Button
		type="submit"
		disabled={isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{localization.MAGIC_LINK_ACTION}
		{/if}
	</Button>
</form>
