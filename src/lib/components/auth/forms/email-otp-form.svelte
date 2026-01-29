<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { Loader2 } from '@lucide/svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
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
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		otpSeparators?: 0 | 1 | 2;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
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
	// svelte-ignore state_referenced_locally -- redirect value is captured once for transition hook
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo
	});

	// Reactive validation schemas
	const emailFormSchema = $derived(
		z.object({
			email: z
				.string()
				.min(1, {
					message: `${localization.EMAIL} ${localization.IS_REQUIRED}`
				})
				.email({
					message: `${localization.EMAIL} ${localization.IS_INVALID}`
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
	const emailForm = createForm(() => ({
		defaultValues: { email: '' },
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: 'sign-in',
				fetchOptions: { throw: true }
			});

			toast.success(localization.EMAIL_OTP_VERIFICATION_SENT);

			verifiedEmail = value.email;
		}
	}));

	// OTP form
	const otpForm = createForm(() => ({
		defaultValues: { code: '' },
		onSubmit: async ({ value }) => {
			await authClient.signIn.emailOtp({
				email: verifiedEmail!,
				otp: value.code,
				fetchOptions: { throw: true }
			});

			await onSuccess();
		}
	}));

	// Computed submitting states
	const emailFormSubmitting = $derived(isSubmittingProp || emailForm.state.isSubmitting);
	const otpFormSubmitting = $derived(
		isSubmittingProp || otpForm.state.isSubmitting || transitionPending
	);

	// Handle email form submission with error handling
	async function handleEmailSubmit(e: Event) {
		e.preventDefault();
		try {
			await emailForm.handleSubmit();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}
	}

	// Handle OTP form submission with error handling
	async function handleOTPSubmit(e?: Event) {
		e?.preventDefault();
		try {
			await otpForm.handleSubmit();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
			// Reset code on error
			otpForm.setFieldValue('code', '');
		}
	}

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(
			emailForm.state.isSubmitting || otpForm.state.isSubmitting || transitionPending
		);
	});

	// Auto-submit when code reaches 6 characters
	$effect(() => {
		const codeField = otpForm.getFieldInfo('code');
		const codeValue = codeField?.instance?.state.value ?? '';
		if (codeValue.length === 6 && !otpForm.state.isSubmitting && verifiedEmail) {
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
		<emailForm.Field name="email" validators={{ onChange: emailFormSchema.shape.email }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<Label for="email" class={classNames?.label}>
						{localization.EMAIL}
					</Label>

					<Input
						id="email"
						type="email"
						placeholder={localization.EMAIL_PLACEHOLDER}
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						disabled={emailFormSubmitting}
						class={classNames?.input}
					/>

					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-destructive', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</emailForm.Field>

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
		<otpForm.Field name="code" validators={{ onChange: otpFormSchema.shape.code }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<Label for="code" class={classNames?.label}>
						{localization.EMAIL_OTP}
					</Label>

					<InputOTP.Root
						value={field.state.value}
						onValueChange={(value) => field.handleChange(value)}
						maxlength={6}
						class={cn(classNames?.otpInputContainer)}
						disabled={otpFormSubmitting}
					>
						{#snippet children({ cells })}
							<OTPInputGroup {otpSeparators} {cells} class={classNames?.otpInput} />
						{/snippet}
					</InputOTP.Root>

					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-destructive', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</otpForm.Field>

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
