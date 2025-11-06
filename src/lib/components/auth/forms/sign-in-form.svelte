<script lang="ts">
	import type { BetterFetchOption } from '@better-fetch/fetch';
	import { Loader2 } from '@lucide/svelte';
	import { z } from 'zod';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getPasswordSchema, isValidEmail } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import type { PasswordValidation } from '$lib/types/password-validation.js';
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
		passwordValidation?: PasswordValidation;
	}

	let {
		className,
		classNames,
		isSubmitting: isSubmittingProp,
		localization: localizationProp,
		redirectTo,
		setIsSubmitting,
		passwordValidation: passwordValidationProp
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
		credentials,
		localization: contextLocalization,
		viewPaths,
		navigate,
		toast,
		Link
	} = config;

	const rememberMeEnabled = credentials?.rememberMe;
	const usernameEnabled = credentials?.username;
	const contextPasswordValidation = credentials?.passwordValidation;

	const localization = $derived({ ...contextLocalization, ...localizationProp });
	const passwordValidation = $derived({
		...contextPasswordValidation,
		...passwordValidationProp
	});

	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo
	});

	// Form schema
	const formSchema = $derived(
		z.object({
			email: usernameEnabled
				? z.string().min(1, {
						error: `${localization.USERNAME} ${localization.IS_REQUIRED}`
					})
				: z.email({
						error: `${localization.EMAIL} ${localization.IS_INVALID}`
					}),
			password: getPasswordSchema(passwordValidation, localization),
			rememberMe: z.boolean().optional()
		})
	);

	// Form state
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(!rememberMeEnabled);
	let formSubmitting = $state(false);
	let errors = $state<Record<string, string | undefined>>({});

	const isSubmitting = $derived(isSubmittingProp || formSubmitting || transitionPending);

	// Update parent isSubmitting state
	$effect(() => {
		setIsSubmitting?.(formSubmitting || transitionPending);
	});

	async function signIn(event: Event) {
		event.preventDefault();

		// Validate form
		const result = formSchema.safeParse({ email, password, rememberMe });

		if (!result.success) {
			errors = {};
			result.error.issues.forEach((err) => {
				if (err.path[0]) {
					errors[err.path[0] as string] = err.message;
				}
			});
			return;
		}

		formSubmitting = true;
		errors = {};

		try {
			let response: Record<string, unknown> = {};

			if (usernameEnabled && !isValidEmail(email)) {
				const fetchOptions: BetterFetchOption = {
					throw: true,
					headers: await getCaptchaHeaders('/sign-in/username')
				};

				response = await authClient.signIn.username({
					username: email,
					password,
					rememberMe,
					fetchOptions
				});
			} else {
				const fetchOptions: BetterFetchOption = {
					throw: true,
					headers: await getCaptchaHeaders('/sign-in/email')
				};

				response = await authClient.signIn.email({
					email,
					password,
					rememberMe,
					fetchOptions
				});
			}

			if (response.twoFactorRedirect) {
				navigate(
					`${basePath}/${viewPaths.TWO_FACTOR}${typeof window !== 'undefined' ? window.location.search : ''}`
				);
			} else {
				await onSuccess();
			}
		} catch (error) {
			password = '';
			resetCaptcha();

			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});
		} finally {
			formSubmitting = false;
		}
	}
</script>

<form
	onsubmit={signIn}
	novalidate={isHydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
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
			bind:value={email}
		/>

		{#if errors.email}
			<p class={cn('text-sm text-destructive', classNames?.error)}>{errors.email}</p>
		{/if}
	</div>

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
			bind:value={password}
		/>

		{#if errors.password}
			<p class={cn('text-sm text-destructive', classNames?.error)}>{errors.password}</p>
		{/if}
	</div>

	{#if rememberMeEnabled}
		<div class="flex items-center space-x-2">
			<Checkbox
				id="rememberMe"
				checked={rememberMe}
				onCheckedChange={(checked) => (rememberMe = checked === true)}
				disabled={isSubmitting}
			/>
			<Label
				for="rememberMe"
				class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{localization.REMEMBER_ME}
			</Label>
		</div>
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
