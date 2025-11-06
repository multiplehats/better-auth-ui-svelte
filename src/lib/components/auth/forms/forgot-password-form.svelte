<script lang="ts">
	import { z } from 'zod';
	import Loader2 from '@lucide/svelte/icons/loader';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte.js';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte.js';
	import Captcha from '$lib/components/captcha/captcha.svelte';
	import { createForm } from '$lib/utils/form.svelte.js';
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
	let captchaRef = $state<any>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	// Form validation schema - created once at initialization
	// Note: Localization is captured at initialization time
	const mergedLocalization = { ...contextLocalization, ...propLocalization };
	const formSchema = z.object({
		email: z
			.email({
				error: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_INVALID}`
			})
			.min(1, {
				error: `${mergedLocalization.EMAIL} ${mergedLocalization.IS_REQUIRED}`
			})
	});

	// Create form with validation and submission handling
	const form = createForm({
		schema: formSchema,
		initialValues: { email: '' },
		onSubmit: async (values) => {
			const baseURL =
				config.baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
			const basePath = config.basePath || '/auth';
			const resetPasswordPath = config.viewPaths.RESET_PASSWORD || 'reset-password';

			const fetchOptions: any = {
				throw: true,
				headers: await captchaHook.getCaptchaHeaders('/forget-password')
			};

			try {
				await authClient.forgetPassword({
					email: values.email,
					redirectTo: `${baseURL}${basePath}/${resetPasswordPath}`,
					fetchOptions
				});

				config.toast({
					variant: 'success',
					message: localization.FORGOT_PASSWORD_EMAIL
				});

				// Navigate to sign in
				const signInPath = config.viewPaths.SIGN_IN || 'sign-in';
				const searchParams = typeof window !== 'undefined' ? window.location.search : '';

				if (typeof window !== 'undefined') {
					window.location.href = `${basePath}/${signInPath}${searchParams}`;
				}
			} catch (error) {
				config.toast({
					variant: 'error',
					message: getLocalizedError({ error, localization })
				});
				captchaHook.resetCaptcha();
				throw error;
			}
		}
	});

	// Sync isSubmitting state
	$effect(() => {
		isSubmitting = form.isSubmitting;
		setIsSubmitting?.(form.isSubmitting);
	});
</script>

<form
	onsubmit={form.handleSubmit}
	novalidate={isHydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<div>
		<Label for="email" class={classNames?.label}>{localization.EMAIL}</Label>

		<Input
			id="email"
			type="email"
			placeholder={localization.EMAIL_PLACEHOLDER}
			bind:value={form.data.email}
			disabled={form.isSubmitting}
			class={classNames?.input}
		/>

		{#if form.errors.email}
			<p class={cn('mt-2 text-sm font-medium text-destructive', classNames?.error)}>
				{form.errors.email[0]}
			</p>
		{/if}
	</div>

	<Captcha {localization} action="/forget-password" />

	<Button
		type="submit"
		disabled={form.isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if form.isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{localization.FORGOT_PASSWORD_ACTION}
		{/if}
	</Button>
</form>
