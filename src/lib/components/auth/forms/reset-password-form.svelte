<script lang="ts">
	import { z } from 'zod';
	import { Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { createForm } from '$lib/utils/form.svelte.js';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import PasswordInput from '$lib/components/password-input.svelte';
	import { cn, getLocalizedError, getPasswordSchema } from '$lib/utils/utils.js';
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

			config.toast({ variant: 'error', message: loc.INVALID_TOKEN });
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

	const form = createForm({
		get schema() {
			return schema;
		},
		initialValues: {
			newPassword: '',
			confirmPassword: ''
		},
		onSubmit: async (values) => {
			try {
				const searchParams = new URLSearchParams(window.location.search);
				const token = searchParams.get('token') as string;

				await authClient.resetPassword({
					newPassword: values.newPassword,
					token,
					fetchOptions: { throw: true }
				});

				config.toast({
					variant: 'success',
					message: loc.RESET_PASSWORD_SUCCESS
				});

				// Navigate to sign in
				const redirectUrl = `${config.basePath}/${config.viewPaths.SIGN_IN}${window.location.search}`;
				config.navigate(redirectUrl);
			} catch (error) {
				config.toast({
					variant: 'error',
					message: getLocalizedError({ error, localization: loc })
				});

				// Reset form on error
				form.reset();
			}
		}
	});
</script>

<form onsubmit={form.handleSubmit} class={cn('grid w-full gap-6', className, classNames?.base)}>
	<div class="space-y-2">
		<label for="newPassword" class={cn('text-sm font-medium', classNames?.label)}>
			{loc.NEW_PASSWORD}
		</label>
		<PasswordInput
			id="newPassword"
			autocomplete="new-password"
			placeholder={loc.NEW_PASSWORD_PLACEHOLDER}
			bind:value={form.data.newPassword}
			disabled={form.isSubmitting}
			class={classNames?.input}
		/>
		{#if form.errors.newPassword}
			<p class={cn('text-sm text-destructive', classNames?.error)}>
				{form.errors.newPassword[0]}
			</p>
		{/if}
	</div>

	{#if confirmPasswordEnabled}
		<div class="space-y-2">
			<label for="confirmPassword" class={cn('text-sm font-medium', classNames?.label)}>
				{loc.CONFIRM_PASSWORD}
			</label>
			<PasswordInput
				id="confirmPassword"
				autocomplete="new-password"
				placeholder={loc.CONFIRM_PASSWORD_PLACEHOLDER}
				bind:value={form.data.confirmPassword}
				disabled={form.isSubmitting}
				class={classNames?.input}
			/>
			{#if form.errors.confirmPassword}
				<p class={cn('text-sm text-destructive', classNames?.error)}>
					{form.errors.confirmPassword[0]}
				</p>
			{/if}
		</div>
	{/if}

	<Button
		type="submit"
		disabled={form.isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if form.isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{loc.RESET_PASSWORD_ACTION}
		{/if}
	</Button>
</form>
