<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import * as z from 'zod';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import SettingsCard, { type SettingsCardClassNames } from '../shared/settings-card.svelte';

	export interface ChangeEmailCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	interface Props extends ChangeEmailCardProps {}

	let { className, classNames, localization: propLocalization, ...restProps }: Props = $props();

	const {
		authClient,
		emailVerification,
		hooks: { useSession },
		localization: contextLocalization,
		toast
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const isPending = $derived('isPending' in $sessionStore ? $sessionStore.isPending : false);

	let resendDisabled = $state(false);

	// Main form for changing email
	const form = createForm(() => ({
		defaultValues: {
			email: sessionData?.user.email || ''
		},
		onSubmit: async ({ value: values }) => {
			if (values.email === sessionData?.user.email) {
				await new Promise((resolve) => setTimeout(resolve, 10));
				toast.error(mergedLocalization.EMAIL_IS_THE_SAME);
				return;
			}

			// Validate email
			const emailSchema = z.string().email({ message: mergedLocalization.INVALID_EMAIL });
			const validation = emailSchema.safeParse(values.email);
			if (!validation.success) {
				const zodError = validation.error as z.ZodError;
				const error = zodError.issues[0];
				form.setFieldMeta('email', (prev) => ({
					...prev,
					errors: [error.message]
				}));
				return;
			}

			try {
				await authClient.changeEmail({
					newEmail: values.email,
					callbackURL: window.location.pathname,
					fetchOptions: { throw: true }
				});

				if (sessionData?.user.emailVerified) {
					toast.success(mergedLocalization.EMAIL_VERIFY_CHANGE!);
				} else {
					// Manually trigger a session reload by calling the session client
					await authClient.getSession();
					toast.success(`${mergedLocalization.EMAIL} ${mergedLocalization.UPDATED_SUCCESSFULLY}`);
				}
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	// Resend verification form
	const resendForm = createForm(() => ({
		onSubmit: async () => {
			if (!sessionData) return;
			const email = sessionData.user.email;

			resendDisabled = true;

			try {
				await authClient.sendVerificationEmail(
					{
						email,
						callbackURL: window.location.pathname
					},
					{
						onError: (ctx) => {
							throw new Error(ctx.error.message || 'Failed to send verification email');
						}
					}
				);

				toast.success(mergedLocalization.EMAIL_VERIFICATION!);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
				resendDisabled = false;
				throw error;
			}
		}
	}));

	// Update form values when session data changes
	$effect(() => {
		if (sessionData?.user.email !== undefined) {
			form.setFieldValue('email', sessionData.user.email || '');
		}
	});
</script>

<div>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			form.handleSubmit();
		}}
		novalidate
	>
		<SettingsCard
			{className}
			{classNames}
			description={mergedLocalization.EMAIL_DESCRIPTION}
			instructions={mergedLocalization.EMAIL_INSTRUCTIONS}
			{isPending}
			title={mergedLocalization.EMAIL}
			actionLabel={mergedLocalization.SAVE}
			{...restProps}
		>
			<CardContent class={classNames?.content}>
				{#if isPending}
					<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
				{:else}
					<form.Field name="email">
						{#snippet children({ state, handleBlur, handleChange })}
							<div class="grid w-full items-center gap-1.5">
								<Input
									class={classNames?.input}
									placeholder={mergedLocalization.EMAIL_PLACEHOLDER}
									type="email"
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
				{/if}
			</CardContent>
		</SettingsCard>
	</form>

	{#if emailVerification?.enabled && sessionData?.user && !sessionData?.user.emailVerified}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				resendForm.handleSubmit();
			}}
		>
			<SettingsCard
				{className}
				{classNames}
				title={mergedLocalization.VERIFY_YOUR_EMAIL}
				description={mergedLocalization.VERIFY_YOUR_EMAIL_DESCRIPTION}
				actionLabel={mergedLocalization.RESEND_VERIFICATION_EMAIL}
				disabled={resendDisabled}
				{...restProps}
			/>
		</form>
	{/if}
</div>
