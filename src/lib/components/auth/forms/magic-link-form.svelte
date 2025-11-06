<script lang="ts">
	import type { BetterFetchOption } from '@better-fetch/fetch';
	import { Loader2 } from '@lucide/svelte';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getSearchParam, getFieldError } from '$lib/utils/utils.js';
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
			email: z.string().min(1, {
				message: `${localization.EMAIL} ${localization.IS_REQUIRED}`
			}).email({
				message: `${localization.EMAIL} ${localization.IS_INVALID}`
			})
		})
	);

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			email: ''
		},
		onSubmit: async ({ value }) => {
			try {
				const fetchOptions: BetterFetchOption = {
					throw: true,
					headers: await getCaptchaHeaders('/sign-in/magic-link')
				};

				await authClient.signIn.magicLink({
					email: value.email,
					callbackURL: getCallbackURL(),
					fetchOptions
				});

				toast.success(localization.MAGIC_LINK_EMAIL || 'Magic link sent to your email');

				// Reset form
				form.reset();
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
				resetCaptcha();
				throw error;
			}
		}
	}));

	const isSubmitting = $derived(isSubmittingProp || form.state.isSubmitting);

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(form.state.isSubmitting);
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
	novalidate={isHydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<form.Field name="email" validators={{ onChange: formSchema.shape.email }}>
		{#snippet children(field)}
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
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
				/>

				{#if field.state.meta.errors.length > 0}
					<p class={cn('text-sm text-destructive', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<Captcha {localization} action="/sign-in/magic-link" />

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
