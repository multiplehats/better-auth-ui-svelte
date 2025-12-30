<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte.js';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte.js';
	import Captcha from '$lib/components/captcha/captcha.svelte';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		isSubmitting = $bindable(false),
		localization: propLocalization,
		setIsSubmitting
	}: Props = $props();

	const authClient = getAuthClient();
	const contextLocalization = getLocalization();
	const config = getAuthUIConfig();
	const isHydrated = useIsHydrated();

	// Merge localizations
	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// Initialize captcha
	const captchaHook = $derived(useCaptcha({ localization }));

	// Local state for captcha binding
	let captchaRef = $state<unknown>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	// Form validation schema - created once at initialization
	// Note: Localization is captured at initialization time
	const mergedLocalization = { ...contextLocalization, ...propLocalization };
	const formSchema = z.object({
		email: z
			.string()
			.min(1, {
				message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`
			})
			.email({
				message: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`
			})
	});

	// Create form with validation and submission handling
	const form = createForm(() => ({
		defaultValues: { email: '' },
		onSubmit: async ({ value }) => {
			const baseURL =
				config.baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
			const basePath = config.basePath || '/auth';
			const resetPasswordPath = config.viewPaths.RESET_PASSWORD || 'reset-password';

			const fetchOptions: Record<string, unknown> = {
				throw: true,
				headers: await captchaHook.getCaptchaHeaders('/forget-password')
			};

			try {
				await authClient.forgetPassword({
					email: value.email,
					redirectTo: `${baseURL}${basePath}/${resetPasswordPath}`,
					fetchOptions
				});

				config.toast.success(localization.FORGOT_PASSWORD_EMAIL);

				// Navigate to sign in
				const signInPath = config.viewPaths.SIGN_IN || 'sign-in';
				const searchParams = typeof window !== 'undefined' ? window.location.search : '';

				if (typeof window !== 'undefined') {
					window.location.href = `${basePath}/${signInPath}${searchParams}`;
				}
			} catch (error) {
				config.toast.error(getLocalizedError({ error, localization }));
				captchaHook.resetCaptcha();
				throw error;
			}
		}
	}));

	// Sync isSubmitting state
	$effect(() => {
		isSubmitting = form.state.isSubmitting;
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
			<div>
				<Label for="email" class={classNames?.label}>{localization.EMAIL}</Label>

				<Input
					id="email"
					type="email"
					placeholder={localization.EMAIL_PLACEHOLDER}
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
					disabled={form.state.isSubmitting}
					class={classNames?.input}
				/>

				{#if field.state.meta.errors.length > 0}
					<p class={cn('mt-2 text-sm font-medium text-destructive', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<Captcha {localization} action="/forget-password" />

	<Button
		type="submit"
		disabled={form.state.isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if form.state.isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{localization.FORGOT_PASSWORD_ACTION}
		{/if}
	</Button>
</form>
