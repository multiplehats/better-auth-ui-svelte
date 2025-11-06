<script lang="ts">
	import { z } from 'zod';
	import { Loader2 } from '@lucide/svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import { createForm } from '$lib/utils/form.svelte.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import OTPInputGroup from '../otp-input-group.svelte';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		callbackURL?: string;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		otpSeparators?: 0 | 1 | 2;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		callbackURL,
		isSubmitting: isSubmittingProp,
		localization: localizationProp,
		otpSeparators = 0,
		redirectTo,
		setIsSubmitting
	}: Props = $props();

	const isHydrated = useIsHydrated();
	const config = getAuthUIConfig();
	const { authClient, localization: contextLocalization, toast } = config;

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	// Track which step we're on
	let verifiedEmail = $state<string | undefined>(undefined);

	// Transition for OTP verification success
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({ redirectTo });

	// Reactive validation schemas
	const emailFormSchema = $derived(
		z.object({
			email: z.email({
				error: `${localization.EMAIL} ${localization.IS_INVALID}`
			})
		})
	);

	const otpFormSchema = $derived(
		z.object({
			code: z
				.string()
				.min(1, {
					message: `${localization.EMAIL_OTP} ${localization.IS_REQUIRED}`
				})
				.min(6, {
					message: `${localization.EMAIL_OTP} ${localization.IS_INVALID}`
				})
		})
	);

	// Email form
	const emailForm = createForm({
		get schema() {
			return emailFormSchema;
		},
		initialValues: { email: '' },
		onSubmit: async (values) => {
			await authClient.emailOtp.sendVerificationOtp({
				email: values.email,
				type: 'sign-in',
				fetchOptions: { throw: true }
			});

			toast({
				variant: 'success',
				message: localization.EMAIL_OTP_VERIFICATION_SENT
			});

			verifiedEmail = values.email;
		}
	});

	// OTP form
	const otpForm = createForm({
		get schema() {
			return otpFormSchema;
		},
		initialValues: { code: '' },
		onSubmit: async (values) => {
			await authClient.signIn.emailOtp({
				email: verifiedEmail!,
				otp: values.code,
				fetchOptions: { throw: true }
			});

			await onSuccess();
		}
	});

	// Computed submitting states
	const emailFormSubmitting = $derived(isSubmittingProp || emailForm.isSubmitting);
	const otpFormSubmitting = $derived(
		isSubmittingProp || otpForm.isSubmitting || transitionPending
	);

	// Handle email form submission with error handling
	async function handleEmailSubmit(e: SubmitEvent) {
		try {
			await emailForm.handleSubmit(e);
		} catch (error) {
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});
		}
	}

	// Handle OTP form submission with error handling
	async function handleOTPSubmit(e?: SubmitEvent) {
		try {
			await otpForm.handleSubmit(e);
		} catch (error) {
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});
			// Reset code on error
			otpForm.data.code = '';
		}
	}

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(emailForm.isSubmitting || otpForm.isSubmitting || transitionPending);
	});

	// Auto-submit when code reaches 6 characters
	$effect(() => {
		if (otpForm.data.code.length === 6 && !otpForm.isSubmitting && verifiedEmail) {
			handleOTPSubmit();
		}
	});
</script>

{#if !verifiedEmail}
	<!-- Step 1: Email input form -->
	<form
		onsubmit={handleEmailSubmit}
		novalidate={isHydrated.value}
		class={cn('grid w-full gap-6', className, classNames?.base)}
	>
		<div class="space-y-2">
			<Label for="email" class={classNames?.label}>
				{localization.EMAIL}
			</Label>

			<Input
				id="email"
				type="email"
				placeholder={localization.EMAIL_PLACEHOLDER}
				disabled={emailFormSubmitting}
				class={classNames?.input}
				bind:value={emailForm.data.email}
			/>

			{#if emailForm.errors.email}
				<p class={cn('text-sm text-destructive', classNames?.error)}>
					{emailForm.errors.email[0]}
				</p>
			{/if}
		</div>

		<Button
			type="submit"
			disabled={emailFormSubmitting}
			class={cn('w-full', classNames?.button, classNames?.primaryButton)}
		>
			{#if emailFormSubmitting}
				<Loader2 class="animate-spin" />
			{:else}
				{localization.EMAIL_OTP_SEND_ACTION}
			{/if}
		</Button>
	</form>
{:else}
	<!-- Step 2: OTP verification form -->
	<form onsubmit={handleOTPSubmit} class={cn('grid w-full gap-6', className, classNames?.base)}>
		<div class="space-y-2">
			<Label for="code" class={classNames?.label}>
				{localization.EMAIL_OTP}
			</Label>

			<InputOTP.Root
				bind:value={otpForm.data.code}
				maxlength={6}
				class={cn(classNames?.otpInputContainer)}
				disabled={otpFormSubmitting}
			>
				{#snippet children({ cells })}
					<OTPInputGroup {otpSeparators} {cells} class={classNames?.otpInput} />
				{/snippet}
			</InputOTP.Root>

			{#if otpForm.errors.code}
				<p class={cn('text-sm text-destructive', classNames?.error)}>
					{otpForm.errors.code[0]}
				</p>
			{/if}
		</div>

		<div class="grid gap-4">
			<Button
				type="submit"
				disabled={otpFormSubmitting}
				class={cn(classNames?.button, classNames?.primaryButton)}
			>
				{#if otpFormSubmitting}
					<Loader2 class="animate-spin" />
				{/if}
				{localization.EMAIL_OTP_VERIFY_ACTION}
			</Button>
		</div>
	</form>
{/if}
