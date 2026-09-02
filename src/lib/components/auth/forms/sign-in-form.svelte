<script lang="ts">
	import type { BetterFetchOption } from '@better-fetch/fetch';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { Loader2 } from '@lucide/svelte';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import {
		cn,
		getLocalizedError,
		isValidEmail,
		getFieldError,
		getSearchParam
	} from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import Captcha from '$lib/components/captcha/captcha.svelte';
	import PasswordInput from '$lib/components/password-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
		setIsSubmitting?: (isSubmitting: boolean) => void;
	}

	let {
		className,
		classNames,
		isSubmitting: isSubmittingProp,
		localization: localizationProp,
		redirectTo,
		setIsSubmitting
	}: Props = $props();

	const isHydrated = useIsHydrated();

	const config = getAuthUIConfig();
	const {
		authClient,
		basePath,
		baseURL,
		credentials,
		emailVerification,
		localization: contextLocalization,
		persistClient,
		redirectTo: contextRedirectTo,
		viewPaths,
		navigate,
		toast,
		Link
	} = config;

	const rememberMeEnabled = credentials?.rememberMe;
	const usernameEnabled = credentials?.username;

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const captchaHook = useCaptcha({ localization: () => localization });
	const { getCaptchaHeaders, resetCaptcha } = captchaHook;

	// Local state for captcha binding
	let captchaRef = $state<unknown>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	const transition = useOnSuccessTransition({ redirectTo: () => redirectTo });
	const { onSuccess } = transition;

	// Resolve the post-verification callback URL. Only used server-side by
	// `emailVerification.sendOnSignIn`: when sign-in is rejected with
	// EMAIL_NOT_VERIFIED, better-auth embeds this callbackURL in the
	// verification email link. Without it the server defaults to "/" (the auth
	// server root), which goes nowhere — so match the sign-up flow's resolution.
	function getRedirectTo() {
		return redirectTo || getSearchParam('redirectTo') || contextRedirectTo;
	}

	function getCallbackURL() {
		return `${baseURL || ''}${
			persistClient
				? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(getRedirectTo())}`
				: getRedirectTo()
		}`;
	}

	// Form schema
	const formSchema = $derived(
		z.object({
			email: usernameEnabled
				? z.string().min(1, {
						message: `${localization.USERNAME} ${localization.IS_REQUIRED}`
					})
				: z
						.string()
						.min(1, {
							message: `${localization.EMAIL} ${localization.IS_REQUIRED}`
						})
						.email({
							message: `${localization.EMAIL} ${localization.IS_INVALID}`
						}),
			password: z.string().min(1, {
				message: localization.PASSWORD_REQUIRED
			}),
			rememberMe: z.boolean().optional()
		})
	);

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: '',
			rememberMe: !rememberMeEnabled
		},
		onSubmit: async ({ value }) => {
			try {
				let response: Record<string, unknown> = {};

				if (usernameEnabled && !isValidEmail(value.email)) {
					const fetchOptions: BetterFetchOption = {
						throw: true,
						headers: await getCaptchaHeaders('/sign-in/username')
					};

					response = await authClient.signIn.username({
						username: value.email,
						password: value.password,
						rememberMe: value.rememberMe,
						callbackURL: getCallbackURL(),
						fetchOptions
					});
				} else {
					const fetchOptions: BetterFetchOption = {
						throw: true,
						headers: await getCaptchaHeaders('/sign-in/email')
					};

					response = await authClient.signIn.email({
						email: value.email,
						password: value.password,
						rememberMe: value.rememberMe,
						callbackURL: getCallbackURL(),
						fetchOptions
					});
				}

				if (response.twoFactorRedirect) {
					const searchParams =
						typeof window !== 'undefined'
							? new SvelteURLSearchParams(window.location.search)
							: new SvelteURLSearchParams();

					const serverMethods = response.twoFactorMethods;
					if (
						Array.isArray(serverMethods) &&
						serverMethods.length > 0 &&
						serverMethods.every((m) => m === 'totp' || m === 'otp')
					) {
						searchParams.set('methods', serverMethods.join(','));
					}

					const search = searchParams.toString();
					navigate(`${basePath}/${viewPaths.TWO_FACTOR}${search ? `?${search}` : ''}`);
				} else {
					await onSuccess();
				}
			} catch (error) {
				form.setFieldValue('password', '');
				resetCaptcha();

				// If the account exists but its email isn't verified, route the
				// user to the verify-email view so they can re-request the
				// verification email, mirroring the sign-up flow.
				const errorCode =
					error && typeof error === 'object' && 'error' in error
						? (error as { error?: { code?: string } }).error?.code
						: undefined;
				if (emailVerification && errorCode === 'EMAIL_NOT_VERIFIED') {
					// Only forward the email when the entered value is actually an
					// email address — with username sign-in the value may be a
					// username, which the verify-email view can't use.
					const emailParam = isValidEmail(value.email)
						? `?email=${encodeURIComponent(value.email)}`
						: '';
					navigate(`${basePath}/${viewPaths.VERIFY_EMAIL}${emailParam}`);
					return;
				}

				toast.error(getLocalizedError({ error, localization }));
				throw error;
			}
		}
	}));

	const formIsSubmitting = form.useStore((s) => s.isSubmitting);
	const isSubmitting = $derived(
		isSubmittingProp || formIsSubmitting.current || transition.isPending
	);

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(formIsSubmitting.current || transition.isPending);
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
					{usernameEnabled ? localization.USERNAME : localization.EMAIL}
				</Label>

				<Input
					id="email"
					name="email"
					autocomplete={usernameEnabled ? 'username' : 'email'}
					class={classNames?.input}
					type={usernameEnabled ? 'text' : 'email'}
					placeholder={usernameEnabled
						? localization.SIGN_IN_USERNAME_PLACEHOLDER
						: localization.EMAIL_PLACEHOLDER}
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

	<form.Field name="password" validators={{ onChange: formSchema.shape.password }}>
		{#snippet children(field)}
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label for="password" class={classNames?.label}>
						{localization.PASSWORD}
					</Label>

					{#if credentials?.forgotPassword}
						<Link
							class={cn('text-sm hover:underline', classNames?.forgotPasswordLink)}
							href={`${basePath}/${viewPaths.FORGOT_PASSWORD}${isHydrated.value && typeof window !== 'undefined' ? window.location.search : ''}`}
						>
							{localization.FORGOT_PASSWORD_LINK}
						</Link>
					{/if}
				</div>

				<PasswordInput
					id="password"
					name="password"
					autocomplete="current-password"
					class={classNames?.input}
					placeholder={localization.PASSWORD_PLACEHOLDER}
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

	{#if rememberMeEnabled}
		<form.Field name="rememberMe">
			{#snippet children(field)}
				<div class="flex items-center space-x-2">
					<Checkbox
						id="rememberMe"
						checked={field.state.value}
						onCheckedChange={(checked) => field.handleChange(checked === true)}
						disabled={isSubmitting}
					/>
					<Label
						for="rememberMe"
						class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{localization.REMEMBER_ME}
					</Label>
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<Captcha {localization} action="/sign-in/email" />

	<Button
		type="submit"
		disabled={isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{localization.SIGN_IN_ACTION}
		{/if}
	</Button>
</form>
