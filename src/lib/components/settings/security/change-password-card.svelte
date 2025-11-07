<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import * as z from 'zod';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError, getPasswordSchema } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { PasswordValidation } from '$lib/types/password-validation.js';
	import PasswordInput from '$lib/components/password-input.svelte';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import SettingsCard, {
		type SettingsCardClassNames
	} from '../shared/settings-card.svelte';
	import { InputFieldSkeleton } from '../skeletons/index.js';

	export interface ChangePasswordCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		accounts?: { providerId: string }[] | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
		skipHook?: boolean;
		passwordValidation?: PasswordValidation;
	}

	interface Props extends ChangePasswordCardProps {}

	let {
		className,
		classNames,
		accounts,
		isPending,
		localization: propLocalization,
		skipHook,
		passwordValidation: propPasswordValidation,
		...restProps
	}: Props = $props();

	const {
		authClient,
		basePath,
		baseURL,
		credentials,
		hooks: { useSession, useListAccounts },
		localization: contextLocalization,
		viewPaths,
		toast
	} = getAuthUIConfig();

	const confirmPasswordEnabled = credentials?.confirmPassword;
	const contextPasswordValidation = credentials?.passwordValidation;

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });
	const mergedPasswordValidation = $derived({
		...contextPasswordValidation,
		...propPasswordValidation
	});

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);

	// Use hook if skipHook is false
	let listAccountsResult: ReturnType<typeof useListAccounts> | undefined = undefined;
	if (!skipHook) {
		listAccountsResult = useListAccounts();
	}

	// Derive accounts and isPending from hook if needed
	const derivedAccounts = $derived(skipHook ? accounts : listAccountsResult?.data);
	const derivedIsPending = $derived(skipHook ? isPending : listAccountsResult?.isPending);

	// Check if credentials are linked
	const credentialsLinked = $derived(
		derivedAccounts?.some((acc) => acc.providerId === 'credential')
	);

	// Build form schema dynamically in form initialization
	const buildFormSchema = () => {
		const localization = mergedLocalization;
		const passwordValidation = mergedPasswordValidation;

		return z
			.object({
				currentPassword: getPasswordSchema(passwordValidation, localization),
				newPassword: getPasswordSchema(passwordValidation, {
					PASSWORD_REQUIRED: localization.NEW_PASSWORD_REQUIRED,
					PASSWORD_TOO_SHORT: localization.PASSWORD_TOO_SHORT,
					PASSWORD_TOO_LONG: localization.PASSWORD_TOO_LONG,
					INVALID_PASSWORD: localization.INVALID_PASSWORD
				} as AuthLocalization),
				confirmPassword: confirmPasswordEnabled
					? getPasswordSchema(passwordValidation, {
							PASSWORD_REQUIRED: localization.CONFIRM_PASSWORD_REQUIRED,
							PASSWORD_TOO_SHORT: localization.PASSWORD_TOO_SHORT,
							PASSWORD_TOO_LONG: localization.PASSWORD_TOO_LONG,
							INVALID_PASSWORD: localization.INVALID_PASSWORD
						} as AuthLocalization)
					: z.string().optional()
			})
			.refine((data) => !confirmPasswordEnabled || data.newPassword === data.confirmPassword, {
				message: localization.PASSWORDS_DO_NOT_MATCH,
				path: ['confirmPassword']
			});
	};

	// Main form for changing password
	const form = createForm(() => ({
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		},
		onSubmit: async ({ value: values }) => {
			// Validate with zod schema
			const formSchema = buildFormSchema();
			const validation = formSchema.safeParse(values);
			if (!validation.success) {
				const zodError = validation.error as z.ZodError;
				const errors = zodError.issues;
				errors.forEach((issue: z.ZodIssue) => {
					const fieldName = issue.path[0] as 'currentPassword' | 'newPassword' | 'confirmPassword';
					form.setFieldMeta(fieldName, (prev) => ({
						...prev,
						errors: [issue.message]
					}));
				});
				return;
			}

			try {
				await authClient.changePassword({
					currentPassword: values.currentPassword,
					newPassword: values.newPassword,
					revokeOtherSessions: true,
					fetchOptions: { throw: true }
				});

				toast.success(mergedLocalization.CHANGE_PASSWORD_SUCCESS!);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
			}

			form.reset();
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	// Set password form
	const setPasswordForm = createForm(() => ({
		onSubmit: async () => {
			if (!sessionData) return;
			const email = sessionData?.user.email;

			try {
				await authClient.requestPasswordReset({
					email,
					redirectTo: `${baseURL}${basePath}/${viewPaths.RESET_PASSWORD}`,
					fetchOptions: { throw: true }
				});

				toast.success(mergedLocalization.FORGOT_PASSWORD_EMAIL!);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
			}
		}
	}));
</script>

{#if !derivedIsPending && !credentialsLinked}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			setPasswordForm.handleSubmit();
		}}
	>
		<SettingsCard
			title={mergedLocalization.SET_PASSWORD}
			description={mergedLocalization.SET_PASSWORD_DESCRIPTION}
			actionLabel={mergedLocalization.SET_PASSWORD}
			isPending={derivedIsPending}
			{className}
			{classNames}
			{...restProps}
		/>
	</form>
{:else}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			form.handleSubmit();
		}}
	>
		<SettingsCard
			{className}
			{classNames}
			actionLabel={mergedLocalization.SAVE}
			description={mergedLocalization.CHANGE_PASSWORD_DESCRIPTION}
			instructions={mergedLocalization.CHANGE_PASSWORD_INSTRUCTIONS}
			isPending={derivedIsPending}
			title={mergedLocalization.CHANGE_PASSWORD}
			{...restProps}
		>
			<CardContent class={cn('grid gap-6', classNames?.content)}>
				{#if derivedIsPending || !derivedAccounts}
					<InputFieldSkeleton {classNames} />
					<InputFieldSkeleton {classNames} />

					{#if confirmPasswordEnabled}
						<InputFieldSkeleton {classNames} />
					{/if}
				{:else}
					<form.Field name="currentPassword">
						{#snippet children({ state, handleBlur, handleChange })}
							<div class="grid w-full items-center gap-1.5">
								<Label for="currentPassword" class={classNames?.label}>
									{mergedLocalization.CURRENT_PASSWORD}
								</Label>

								<PasswordInput
									id="currentPassword"
									name="currentPassword"
									class={classNames?.input}
									autocomplete="current-password"
									placeholder={mergedLocalization.CURRENT_PASSWORD_PLACEHOLDER}
									disabled={isSubmitting}
									value={state.value}
									onblur={handleBlur}
									oninput={(e) => handleChange(e.currentTarget.value)}
								/>

								{#if state.meta.errors.length > 0}
									<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
										{state.meta.errors[0]}
									</p>
								{/if}
							</div>
						{/snippet}
					</form.Field>

					<form.Field name="newPassword">
						{#snippet children({ state, handleBlur, handleChange })}
							<div class="grid w-full items-center gap-1.5">
								<Label for="newPassword" class={classNames?.label}>
									{mergedLocalization.NEW_PASSWORD}
								</Label>

								<PasswordInput
									id="newPassword"
									name="newPassword"
									class={classNames?.input}
									autocomplete="new-password"
									disabled={isSubmitting}
									placeholder={mergedLocalization.NEW_PASSWORD_PLACEHOLDER}
									enableToggle
									value={state.value}
									onblur={handleBlur}
									oninput={(e) => handleChange(e.currentTarget.value)}
								/>

								{#if state.meta.errors.length > 0}
									<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
										{state.meta.errors[0]}
									</p>
								{/if}
							</div>
						{/snippet}
					</form.Field>

					{#if confirmPasswordEnabled}
						<form.Field name="confirmPassword">
							{#snippet children({ state, handleBlur, handleChange })}
								<div class="grid w-full items-center gap-1.5">
									<Label for="confirmPassword" class={classNames?.label}>
										{mergedLocalization.CONFIRM_PASSWORD}
									</Label>

									<PasswordInput
										id="confirmPassword"
										name="confirmPassword"
										class={classNames?.input}
										autocomplete="new-password"
										placeholder={mergedLocalization.CONFIRM_PASSWORD_PLACEHOLDER}
										disabled={isSubmitting}
										enableToggle
										value={state.value}
										onblur={handleBlur}
										oninput={(e) => handleChange(e.currentTarget.value)}
									/>

									{#if state.meta.errors.length > 0}
										<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
											{state.meta.errors[0]}
										</p>
									{/if}
								</div>
							{/snippet}
						</form.Field>
					{/if}
				{/if}
			</CardContent>
		</SettingsCard>
	</form>
{/if}
