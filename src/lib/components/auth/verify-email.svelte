<script lang="ts">
	import { onMount } from 'svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import MailOpen from '@lucide/svelte/icons/mail-open';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	interface Props {
		className?: string;
		classNames?: {
			base?: string;
			content?: string;
			description?: string;
			header?: string;
			title?: string;
			email?: string;
			icon?: string;
		};
		localization?: Partial<AuthLocalization>;
		email?: string;
	}

	let { className, classNames, localization: localizationProp, email: emailProp }: Props = $props();

	const config = getAuthUIConfig();
	const localization = $derived({ ...config.localization, ...localizationProp });

	// State management
	let email = $state(emailProp || '');
	let isResending = $state(false);
	let resendDisabled = $state(false);
	let countdown = $state(0);
	let verificationToken = $state<string | null>(null);
	let isVerifying = $state(false);
	let isVerified = $state(false);
	let verificationError = $state<string | null>(null);

	onMount(() => {
		// Try to get email and token from URL params
		const searchParams = new URLSearchParams(window.location.search);
		const emailParam = searchParams.get('email');
		const tokenParam = searchParams.get('token');
		const verifiedParam = searchParams.get('verified');

		if (emailParam) {
			email = emailParam; // URLSearchParams.get() already decodes the value
		}

		// Check if we just completed verification (when redirectToVerifyPage is true)
		if (verifiedParam === 'true') {
			isVerified = true;
			// Clean up URL
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.delete('verified');
			newUrl.searchParams.delete('token');
			window.history.replaceState({}, '', newUrl.toString());
		} else if (tokenParam) {
			verificationToken = tokenParam;
		}

		// Note: If the server is configured with emailOTP.overrideDefaultEmailVerification,
		// users won't receive token-based verification links. They'll use OTP instead.
		// This component handles standard token-based verification only.

		// Start cooldown immediately if user just arrived (they've already received initial email)
		// Only start if: we have an email, not verified, and no token (not coming from email link)
		if (email && verifiedParam !== 'true' && !tokenParam) {
			const emailVerificationConfig =
				typeof config.emailVerification === 'object' ? config.emailVerification : {};
			const cooldownPeriod = emailVerificationConfig.resendCooldown || 60;
			const storageKey = `verify-email-cooldown-${email}`;

			// Check if there's an existing cooldown in localStorage
			const storedCooldown = localStorage.getItem(storageKey);
			if (storedCooldown) {
				const { expiresAt } = JSON.parse(storedCooldown);
				const remainingTime = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

				if (remainingTime > 0) {
					countdown = remainingTime;
					resendDisabled = true;
				} else {
					// Expired, remove it
					localStorage.removeItem(storageKey);
				}
			} else {
				// No stored cooldown, start a new one (user just signed up)
				countdown = cooldownPeriod;
				resendDisabled = true;

				// Store in localStorage
				localStorage.setItem(
					storageKey,
					JSON.stringify({
						expiresAt: Date.now() + cooldownPeriod * 1000
					})
				);
			}
		}
	});

	// Countdown timer effect
	$effect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => {
				countdown--;
			}, 1000);

			return () => clearTimeout(timer);
		} else if (resendDisabled) {
			// Countdown reached 0, re-enable button and clean up localStorage
			resendDisabled = false;
			if (email) {
				const storageKey = `verify-email-cooldown-${email}`;
				localStorage.removeItem(storageKey);
			}
		}
	});

	const handleResendEmail = async () => {
		if (!email || resendDisabled) return;

		isResending = true;

		try {
			// Build the callback URL based on configuration
			// When redirectToVerifyPage is true (typically when autoSignInAfterVerification is false),
			// redirect back to verify-email page to show success message
			const verifyEmailPath = `${config.basePath}/${config.viewPaths.VERIFY_EMAIL}`;
			const emailVerificationConfig =
				typeof config.emailVerification === 'object' ? config.emailVerification : {};
			const callbackURL = emailVerificationConfig.redirectToVerifyPage
				? `${verifyEmailPath}?verified=true&email=${encodeURIComponent(email)}`
				: config.redirectTo || '/';

			await config.authClient.sendVerificationEmail(
				{
					email,
					callbackURL
				},
				{
					onError: (ctx) => {
						throw new Error(ctx.error.message || 'Failed to send verification email');
					}
				}
			);

			config.toast.success(localization.EMAIL_VERIFICATION);

			// Start countdown with configured cooldown period
			const cooldownPeriod = emailVerificationConfig.resendCooldown || 60;
			countdown = cooldownPeriod;
			resendDisabled = true;

			// Store in localStorage for persistence across page reloads
			const storageKey = `verify-email-cooldown-${email}`;
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					expiresAt: Date.now() + cooldownPeriod * 1000
				})
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : localization.REQUEST_FAILED;
			config.toast.error(errorMessage);
		} finally {
			isResending = false;
		}
	};

	const handleVerifyEmail = async () => {
		if (!verificationToken || isVerifying) return;

		isVerifying = true;
		verificationError = null;

		try {
			await config.authClient.verifyEmail({
				query: {
					token: verificationToken
				}
			});

			isVerified = true;
			config.toast.success(
				localization.EMAIL_VERIFICATION_SUCCESS || 'Email verified successfully!'
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: localization.EMAIL_VERIFICATION_FAILED || 'Failed to verify email';
			verificationError = errorMessage;
			config.toast.error(errorMessage);
		} finally {
			isVerifying = false;
		}
	};

	const handleBackToSignIn = () => {
		const signInPath = `${config.basePath}/${config.viewPaths.SIGN_IN}`;
		config.navigate(signInPath);
	};
</script>

<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
	<Card.Header class={cn('text-center', classNames?.header)}>
		<div
			class={cn(
				'mx-auto mb-4 flex size-12 items-center justify-center rounded-full',
				isVerified ? 'bg-green-100 dark:bg-green-900/20' : 'bg-primary/10',
				classNames?.icon
			)}
		>
			{#if isVerified}
				<CheckCircle class="size-6 text-green-600 dark:text-green-400" />
			{:else}
				<MailOpen class="size-6 text-primary" />
			{/if}
		</div>

		<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
			{#if isVerified}
				{localization.EMAIL_VERIFIED || 'Email Verified!'}
			{:else if verificationToken}
				{localization.VERIFY_EMAIL_TITLE || 'Verify Your Email'}
			{:else}
				{localization.EMAIL_VERIFICATION_REQUIRED}
			{/if}
		</Card.Title>

		<Card.Description class={cn('text-xs md:text-sm', classNames?.description)}>
			{#if isVerified}
				{localization.EMAIL_VERIFICATION_SUCCESS_DESCRIPTION}
			{:else if verificationToken}
				{localization.VERIFY_EMAIL_TOKEN_DESCRIPTION}
				{#if email}
					<span class={cn('mt-1 block font-medium text-foreground', classNames?.email)}>
						{email}
					</span>
				{/if}
			{:else}
				{localization.EMAIL_VERIFICATION_SENT_TO}
				{#if email}
					<span class={cn('mt-1 block font-medium text-foreground', classNames?.email)}>
						{email}
					</span>
				{/if}
			{/if}
		</Card.Description>
	</Card.Header>

	<Card.Content
		class={cn('grid gap-4 text-center text-sm text-muted-foreground', classNames?.content)}
	>
		{#if isVerified}
			<!-- Success state -->
			<p>
				{localization.EMAIL_VERIFICATION_SUCCESS_MESSAGE ||
					'You can now access all features of your account.'}
			</p>

			<Button onclick={handleBackToSignIn} class="w-full">
				{localization.CONTINUE_TO_SIGN_IN || 'Continue to Sign In'} →
			</Button>
		{:else if verificationToken}
			<!-- Token present state -->
			{#if verificationError}
				<p class="text-destructive">{verificationError}</p>
			{/if}

			<Button onclick={handleVerifyEmail} disabled={isVerifying} class="w-full">
				{#if isVerifying}
					{localization.VERIFYING || 'Verifying'}...
				{:else}
					{localization.VERIFY_EMAIL_BUTTON || 'Verify Email'}
				{/if}
			</Button>

			<Button variant="ghost" onclick={handleBackToSignIn} class="w-full">
				← {localization.BACK_TO_SIGN_IN}
			</Button>
		{:else}
			<!-- Waiting for email state -->
			<p>{localization.EMAIL_VERIFICATION_CHECK_INBOX}</p>
			<p>{localization.EMAIL_VERIFICATION_AFTER_VERIFY}</p>

			<div class="mt-4 flex flex-col gap-2">
				<div class="text-sm text-muted-foreground">
					{localization.EMAIL_VERIFICATION_NO_EMAIL}
				</div>

				<Button
					variant="outline"
					disabled={isResending || resendDisabled}
					onclick={handleResendEmail}
					class="w-full"
				>
					{#if countdown > 0}
						{localization.RESEND_VERIFICATION_EMAIL} ({countdown}s)
					{:else if isResending}
						{localization.RESEND_VERIFICATION_EMAIL}...
					{:else}
						{localization.RESEND_VERIFICATION_EMAIL}
					{/if}
				</Button>
			</div>

			<div class="mt-2">
				<Button variant="ghost" onclick={handleBackToSignIn} class="w-full">
					← {localization.BACK_TO_SIGN_IN}
				</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
