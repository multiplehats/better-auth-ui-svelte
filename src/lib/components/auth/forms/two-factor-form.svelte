<script lang="ts">
	import { z } from 'zod';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import QrCodeIcon from '@lucide/svelte/icons/qr-code';
	import SendIcon from '@lucide/svelte/icons/send';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import {
		getAuthUIConfig,
		getAuthClient,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getSearchParam } from '$lib/utils/utils.js';
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

	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo
	});

	// Get session data to check if 2FA is being enabled
	const sessionQuery = hooks?.useSession?.();
	const sessionData = $derived(sessionQuery && 'data' in sessionQuery ? sessionQuery.data as { user?: User } | null : undefined);
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

	// Form state
	let code = $state('');
	let trustDevice = $state(false);
	let errors = $state<Record<string, string | undefined>>({});
	let formSubmitting = $state(false);

	const isSubmitting = $derived(isSubmittingProp || formSubmitting || transitionPending);

	// Update parent isSubmitting state
	$effect(() => {
		if (setIsSubmitting) {
			setIsSubmitting(formSubmitting || transitionPending);
		}
	});

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
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});

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

	function validate(): boolean {
		try {
			formSchema.parse({ code, trustDevice });
			errors = {};
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string> = {};
				error.issues.forEach((err: z.ZodIssue) => {
					if (err.path.length > 0) {
						fieldErrors[err.path[0] as string] = err.message;
					}
				});
				errors = fieldErrors;
			}
			return false;
		}
	}

	function reset() {
		code = '';
		trustDevice = false;
		errors = {};
	}

	async function verifyCode() {
		if (!validate()) return;

		formSubmitting = true;

		try {
			const verifyMethod =
				method === 'totp' ? authClient.twoFactor.verifyTotp : authClient.twoFactor.verifyOtp;

			await verifyMethod({
				code,
				trustDevice,
				fetchOptions: { throw: true }
			});

			await onSuccess();

			if (sessionData && !isTwoFactorEnabled) {
				toast({
					variant: 'success',
					message: localization?.TWO_FACTOR_ENABLED
				});
			}
		} catch (error) {
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});

			reset();
		} finally {
			formSubmitting = false;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		await verifyCode();
	}
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
				bind:value={code}
				maxlength={6}
				onComplete={() => {
					// Auto-submit when all 6 digits are entered
					if (code.length === 6) {
						verifyCode();
					}
				}}
				disabled={isSubmitting}
				class={classNames?.otpInputContainer}
			>
				{#snippet children({ cells })}
					<OTPInputGroup {otpSeparators} {cells} class={classNames?.otpInput} />
				{/snippet}
			</InputOTP.Root>

			{#if errors.code}
				<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
					{errors.code}
				</p>
			{/if}
		</div>

		<!-- Trust Device Checkbox -->
		<div class="flex items-center gap-2">
			<Checkbox
				id="trustDevice"
				bind:checked={trustDevice}
				disabled={isSubmitting}
				class={classNames?.checkbox}
			/>
			<Label for="trustDevice" class={cn('cursor-pointer', classNames?.label)}>
				{localization.TRUST_DEVICE}
			</Label>
		</div>
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
