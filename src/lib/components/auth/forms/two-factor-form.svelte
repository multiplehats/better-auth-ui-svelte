<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import SendIcon from '@lucide/svelte/icons/send';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getAuthUIConfig, getAuthClient } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getSearchParam, getFieldError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import type { User } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { QRCode } from '$lib/components/ui/qr-code/index.js';
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
	const totpURI = $derived(isHydrated ? getSearchParam('totpURI') : null);
	let initialSendRef = $state(false);

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const {
		basePath,
		hooks,
		localization: contextLocalization,
		twoFactor,
		viewPaths,
		toast,
		Link
	} = config;

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const redirectToValue = $derived(redirectTo);
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo: redirectToValue
	});

	// Get session data to check if 2FA is being enabled
	const sessionQuery = hooks?.useSession?.();
	const sessionData = $derived(
		sessionQuery && 'data' in sessionQuery
			? (sessionQuery.data as { user?: User } | null)
			: undefined
	);
	const isTwoFactorEnabled = $derived((sessionData?.user as User | undefined)?.twoFactorEnabled);

	const twoFactorMethods = $derived(twoFactor || ['totp']);
	let method = $state<'totp' | 'otp' | null>(null);

	// Initialize method based on twoFactorMethods
	$effect(() => {
		if (twoFactorMethods.length === 1) {
			method = twoFactorMethods[0] as 'totp' | 'otp';
		}
	});

	let isSendingOtp = $state(false);
	let cooldownSeconds = $state(0);

	// Form schema
	const formSchema = $derived(
		z.object({
			code: z
				.string()
				.min(1, {
					message: `${localization.ONE_TIME_PASSWORD} ${localization.IS_REQUIRED}`
				})
				.min(6, {
					message: `${localization.ONE_TIME_PASSWORD} ${localization.IS_INVALID}`
				}),
			trustDevice: z.boolean().optional()
		})
	);

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			code: '',
			trustDevice: false
		},
		onSubmit: async ({ value }) => {
			try {
				const verifyMethod =
					method === 'totp' ? authClient.twoFactor.verifyTotp : authClient.twoFactor.verifyOtp;

				await verifyMethod({
					code: value.code,
					trustDevice: value.trustDevice,
					fetchOptions: { throw: true }
				});

				await onSuccess();

				if (sessionData && !isTwoFactorEnabled) {
					toast.success(localization?.TWO_FACTOR_ENABLED);
				}
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));

				form.reset();
				throw error;
			}
		}
	}));

	const isSubmitting = $derived(isSubmittingProp || form.state.isSubmitting || transitionPending);

	// Update parent isSubmitting state
	$effect(() => {
		if (setIsSubmitting) {
			setIsSubmitting(form.state.isSubmitting || transitionPending);
		}
	});

	// Auto-send OTP on mount if method is OTP
	$effect(() => {
		if (method === 'otp' && cooldownSeconds <= 0 && !initialSendRef) {
			initialSendRef = true;
			sendOtp();
		}
	});

	// Cooldown timer
	$effect(() => {
		if (cooldownSeconds > 0) {
			const timer = setTimeout(() => {
				cooldownSeconds--;
			}, 1000);

			return () => clearTimeout(timer);
		}
	});

	async function sendOtp() {
		if (isSendingOtp || cooldownSeconds > 0) return;

		try {
			isSendingOtp = true;
			await authClient.twoFactor.sendOtp({
				fetchOptions: { throw: true }
			});
			cooldownSeconds = 60;
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));

			if (error && typeof error === 'object' && 'error' in error) {
				const betterError = error as { error: { code?: string } };
				if (betterError.error?.code === 'INVALID_TWO_FACTOR_COOKIE') {
					window.history.back();
				}
			}
		} finally {
			initialSendRef = false;
			isSendingOtp = false;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		await form.handleSubmit();
	}

	// Auto-submit when code reaches 6 characters
	$effect(() => {
		const codeField = form.getFieldInfo('code');
		const codeValue = codeField?.instance?.state.value ?? '';
		if (codeValue.length === 6 && !form.state.isSubmitting) {
			form.handleSubmit();
		}
	});
</script>

<form onsubmit={handleSubmit} class={cn('grid w-full gap-6', className, classNames?.base)}>
	<!-- QR Code Display for TOTP Setup -->
	{#if twoFactorMethods.includes('totp') && totpURI && method === 'totp'}
		<div class="space-y-3">
			<Label class={classNames?.label}>{localization.TWO_FACTOR_TOTP_LABEL}</Label>

			<div class={cn('border shadow-xs', classNames?.qrCode)}>
				<QRCode content={totpURI} />
			</div>
		</div>
	{/if}

	{#if method !== null}
		<!-- OTP Code Input Field -->
		<form.Field name="code" validators={{ onChange: formSchema.shape.code }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label class={classNames?.label}>
							{localization.ONE_TIME_PASSWORD}
						</Label>

						<Link
							class={cn('text-sm hover:underline', classNames?.forgotPasswordLink)}
							href={`${basePath}/${viewPaths.RECOVER_ACCOUNT}${isHydrated ? window.location.search : ''}`}
						>
							{localization.FORGOT_AUTHENTICATOR}
						</Link>
					</div>

					<InputOTP.Root
						value={field.state.value}
						onValueChange={(value) => field.handleChange(value)}
						maxlength={6}
						disabled={isSubmitting}
						class={classNames?.otpInputContainer}
					>
						{#snippet children({ cells })}
							<OTPInputGroup {otpSeparators} {cells} class={classNames?.otpInput} />
						{/snippet}
					</InputOTP.Root>

					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>

		<!-- Trust Device Checkbox -->
		<form.Field name="trustDevice">
			{#snippet children(field)}
				<div class="flex items-center gap-2">
					<Checkbox
						id="trustDevice"
						checked={field.state.value}
						onCheckedChange={(checked) => field.handleChange(checked === true)}
						disabled={isSubmitting}
						class={classNames?.checkbox}
					/>
					<Label for="trustDevice" class={cn('cursor-pointer', classNames?.label)}>
						{localization.TRUST_DEVICE}
					</Label>
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<!-- Action Buttons -->
	<div class="grid gap-4">
		{#if method !== null}
			<Button
				type="submit"
				disabled={isSubmitting}
				class={cn(classNames?.button, classNames?.primaryButton)}
			>
				{#if isSubmitting}
					<Loader2 class="animate-spin" />
				{/if}
				{localization.TWO_FACTOR_ACTION}
			</Button>
		{/if}

		<!-- Resend OTP Button (shown when method is OTP) -->
		{#if method === 'otp' && twoFactorMethods.includes('otp')}
			<Button
				type="button"
				variant="outline"
				onclick={sendOtp}
				disabled={cooldownSeconds > 0 || isSendingOtp || isSubmitting}
				class={cn(classNames?.button, classNames?.outlineButton)}
			>
				{#if isSendingOtp}
					<Loader2 class="animate-spin" />
				{:else}
					<SendIcon class={classNames?.icon} />
				{/if}

				{localization.RESEND_CODE}
				{#if cooldownSeconds > 0}
					({cooldownSeconds})
				{/if}
			</Button>
		{/if}

		<!-- Switch to OTP Method -->
		{#if method !== 'otp' && twoFactorMethods.includes('otp')}
			<Button
				type="button"
				variant="secondary"
				class={cn(classNames?.button, classNames?.secondaryButton)}
				onclick={() => (method = 'otp')}
				disabled={isSubmitting}
			>
				<SendIcon class={classNames?.icon} />
				{localization.SEND_VERIFICATION_CODE}
			</Button>
		{/if}

		<!-- Switch to TOTP Method -->
		{#if method !== 'totp' && twoFactorMethods.includes('totp')}
			<Button
				type="button"
				variant="secondary"
				class={cn(classNames?.button, classNames?.secondaryButton)}
				onclick={() => (method = 'totp')}
				disabled={isSubmitting}
			>
				<QrCodeIcon class={classNames?.icon} />
				{localization.CONTINUE_WITH_AUTHENTICATOR}
			</Button>
		{/if}
	</div>
</form>
