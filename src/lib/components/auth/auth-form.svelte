<script lang="ts" module>
	export interface AuthFormClassNames {
		base?: string;
		button?: string;
		checkbox?: string;
		description?: string;
		error?: string;
		forgotPasswordLink?: string;
		icon?: string;
		input?: string;
		label?: string;
		otpInput?: string;
		otpInputContainer?: string;
		outlineButton?: string;
		primaryButton?: string;
		providerButton?: string;
		qrCode?: string;
		secondaryButton?: string;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { getViewByPath } from '$lib/utils/utils.js';
	import type { AuthViewPath } from '$lib/utils/view-paths.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import SignInForm from './forms/sign-in-form.svelte';
	import SignUpForm from './forms/sign-up-form.svelte';
	import ForgotPasswordForm from './forms/forgot-password-form.svelte';
	import ResetPasswordForm from './forms/reset-password-form.svelte';
	import MagicLinkForm from './forms/magic-link-form.svelte';
	import EmailOTPForm from './forms/email-otp-form.svelte';
	import TwoFactorForm from './forms/two-factor-form.svelte';
	import RecoverAccountForm from './forms/recover-account-form.svelte';
	import SignOut from './sign-out.svelte';
	import AuthCallback from './auth-callback.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		callbackURL?: string;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		pathname?: string;
		redirectTo?: string;
		view?: AuthViewPath;
		otpSeparators?: 0 | 1 | 2;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		callbackURL,
		isSubmitting = $bindable(),
		localization: localizationProp,
		pathname,
		redirectTo,
		view: viewProp,
		otpSeparators = 0,
		setIsSubmitting
	}: Props = $props();

	const config = getAuthUIConfig();

	const {
		basePath,
		credentials,
		localization: contextLocalization,
		magicLink,
		emailOTP,
		signUp,
		twoFactor: twoFactorEnabled,
		viewPaths,
		replace
	} = config;

	const signUpEnabled = !!signUp;

	// Merge localization from context and props
	const localization = $derived({ ...contextLocalization, ...localizationProp });

	// Determine view from prop or pathname
	let view = $derived<AuthViewPath>(
		viewProp || (getViewByPath(viewPaths, pathname) as AuthViewPath) || 'SIGN_IN'
	);
</script>

{#if view === 'SIGN_OUT'}
	<SignOut />
{:else if view === 'CALLBACK'}
	<AuthCallback {redirectTo} />
{:else if view === 'SIGN_IN'}
	{#if credentials}
		<SignInForm
			{className}
			{classNames}
			{localization}
			{redirectTo}
			{isSubmitting}
			{setIsSubmitting}
		/>
	{:else if magicLink}
		<MagicLinkForm
			{className}
			{classNames}
			{callbackURL}
			{localization}
			{redirectTo}
			{isSubmitting}
			{setIsSubmitting}
		/>
	{:else if emailOTP}
		<EmailOTPForm
			{className}
			{classNames}
			{callbackURL}
			{localization}
			{redirectTo}
			{isSubmitting}
			{setIsSubmitting}
		/>
	{/if}
{:else if view === 'TWO_FACTOR'}
	<TwoFactorForm
		{className}
		{classNames}
		{localization}
		{otpSeparators}
		{redirectTo}
		{isSubmitting}
		{setIsSubmitting}
	/>
{:else if view === 'RECOVER_ACCOUNT'}
	<RecoverAccountForm
		{className}
		{classNames}
		{localization}
		{redirectTo}
		{isSubmitting}
		{setIsSubmitting}
	/>
{:else if view === 'MAGIC_LINK'}
	<MagicLinkForm
		{className}
		{classNames}
		{callbackURL}
		{localization}
		{redirectTo}
		{isSubmitting}
		{setIsSubmitting}
	/>
{:else if view === 'EMAIL_OTP'}
	<EmailOTPForm
		{className}
		{classNames}
		{callbackURL}
		{localization}
		{redirectTo}
		{isSubmitting}
		{setIsSubmitting}
	/>
{:else if view === 'FORGOT_PASSWORD'}
	<ForgotPasswordForm {className} {classNames} {localization} {isSubmitting} {setIsSubmitting} />
{:else if view === 'RESET_PASSWORD'}
	<ResetPasswordForm {className} {classNames} {localization} />
{:else if view === 'SIGN_UP' && signUpEnabled}
	<SignUpForm
		{className}
		{classNames}
		{callbackURL}
		{localization}
		{redirectTo}
		{isSubmitting}
		{setIsSubmitting}
	/>
{/if}
