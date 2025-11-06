<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import PasswordInput from '$lib/components/password-input.svelte';
	import { cn, getLocalizedError, getPasswordSchema, getFieldError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import type { PasswordValidation } from '$lib/types/password-validation.js';

	interface Props {
		className?: string;
		classNames?: {
			base?: string;
			button?: string;
			error?: string;
			input?: string;
			label?: string;
			primaryButton?: string;
		};
		localization?: Partial<AuthLocalization>;
		passwordValidation?: PasswordValidation;
	}

	let { className, classNames, localization, passwordValidation }: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	// Merge context localization with prop localization
	const loc = $derived({ ...contextLocalization, ...localization });

	// Merge context password validation with prop password validation
	const contextPasswordValidation = config.credentials?.passwordValidation;
	const mergedPasswordValidation = $derived({
		...contextPasswordValidation,
		...passwordValidation
	});

	const confirmPasswordEnabled = config.credentials?.confirmPassword;

	let tokenChecked = $state(false);

	// Check for valid token on mount (equivalent to useRef pattern in React)
	onMount(() => {
		if (tokenChecked) return;
		tokenChecked = true;

		const searchParams = new URLSearchParams(window.location.search);
		const token = searchParams.get('token');

		if (!token || token === 'INVALID_TOKEN') {
			// Navigate to sign in with error toast
			const redirectUrl = `${config.basePath}/${config.viewPaths.SIGN_IN}${window.location.search}`;

			config.toast.error(loc.INVALID_TOKEN);
			config.navigate(redirectUrl);
		}
	});

	// Build schema dynamically with proper validation
	const schema = $derived.by(() => {
		const baseSchema = {
			newPassword: getPasswordSchema(mergedPasswordValidation, {
				PASSWORD_REQUIRED: loc.NEW_PASSWORD_REQUIRED,
				PASSWORD_TOO_SHORT: loc.PASSWORD_TOO_SHORT,
				PASSWORD_TOO_LONG: loc.PASSWORD_TOO_LONG,
				INVALID_PASSWORD: loc.INVALID_PASSWORD
			}),
			confirmPassword: confirmPasswordEnabled
				? getPasswordSchema(mergedPasswordValidation, {
						PASSWORD_REQUIRED: loc.CONFIRM_PASSWORD_REQUIRED,
						PASSWORD_TOO_SHORT: loc.PASSWORD_TOO_SHORT,
						PASSWORD_TOO_LONG: loc.PASSWORD_TOO_LONG,
						INVALID_PASSWORD: loc.INVALID_PASSWORD
					})
				: z.string().optional()
		};

		const schemaObject = z.object(baseSchema);

		if (confirmPasswordEnabled) {
			return schemaObject.refine((data) => data.newPassword === data.confirmPassword, {
				message: loc.PASSWORDS_DO_NOT_MATCH,
				path: ['confirmPassword']
			});
		}

		return schemaObject;
	});

	const form = createForm(() => ({
		defaultValues: {
			newPassword: '',
			confirmPassword: ''
		},
		onSubmit: async ({ value }) => {
			try {
				const searchParams = new URLSearchParams(window.location.search);
				const token = searchParams.get('token') as string;

				await authClient.resetPassword({
					newPassword: value.newPassword,
					token,
					fetchOptions: { throw: true }
				});

				config.toast.success(loc.RESET_PASSWORD_SUCCESS);

				// Navigate to sign in
				const redirectUrl = `${config.basePath}/${config.viewPaths.SIGN_IN}${window.location.search}`;
				config.navigate(redirectUrl);
			} catch (error) {
				config.toast.error(getLocalizedError({ error, localization: loc }));

				// Reset form on error
				form.reset();
			}
		}
	}));
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<form.Field name="newPassword" validators={{ onChange: schema.shape.newPassword }}>
		{#snippet children(field)}
			<div class="space-y-2">
				<label for="newPassword" class={cn('text-sm font-medium', classNames?.label)}>
					{loc.NEW_PASSWORD}
				</label>
				<PasswordInput
					id="newPassword"
					autocomplete="new-password"
					placeholder={loc.NEW_PASSWORD_PLACEHOLDER}
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
					disabled={form.state.isSubmitting}
					class={classNames?.input}
				/>
				{#if field.state.meta.errors.length > 0}
					<p class={cn('text-sm text-destructive', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	{#if confirmPasswordEnabled}
		<form.Field name="confirmPassword" validators={{ onChange: getPasswordSchema(mergedPasswordValidation, {
			PASSWORD_REQUIRED: loc.CONFIRM_PASSWORD_REQUIRED,
			PASSWORD_TOO_SHORT: loc.PASSWORD_TOO_SHORT,
			PASSWORD_TOO_LONG: loc.PASSWORD_TOO_LONG,
			INVALID_PASSWORD: loc.INVALID_PASSWORD
		}) }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<label for="confirmPassword" class={cn('text-sm font-medium', classNames?.label)}>
						{loc.CONFIRM_PASSWORD}
					</label>
					<PasswordInput
						id="confirmPassword"
						autocomplete="new-password"
						placeholder={loc.CONFIRM_PASSWORD_PLACEHOLDER}
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						disabled={form.state.isSubmitting}
						class={classNames?.input}
					/>
					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-destructive', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<Button
		type="submit"
		disabled={form.state.isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if form.state.isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{loc.RESET_PASSWORD_ACTION}
		{/if}
	</Button>
</form>
