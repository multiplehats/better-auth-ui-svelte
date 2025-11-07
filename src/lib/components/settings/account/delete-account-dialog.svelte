<script lang="ts">
	import type { Account } from 'better-auth';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import UserView from '$lib/components/user-view.svelte';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		accounts?: Account[] | null;
		localization?: Partial<AuthLocalization>;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		classNames,
		accounts,
		localization: propLocalization,
		open,
		onOpenChange
	}: Props = $props();

	const {
		authClient,
		basePath,
		baseURL,
		deleteUser,
		freshAge,
		hooks: { useSession },
		localization: contextLocalization,
		viewPaths,
		navigate,
		toast
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...propLocalization };

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const session = $derived(sessionData?.session);
	const user = $derived(sessionData?.user);

	const isFresh = $derived(
		session ? Date.now() - new Date(session.createdAt).getTime() < freshAge * 1000 : false
	);

	const credentialsLinked = $derived(accounts?.some((acc) => acc.providerId === 'credential'));

	const formSchema = $derived(
		z.object({
			password: credentialsLinked
				? z.string().min(1, { message: mergedLocalization.PASSWORD_REQUIRED! })
				: z.string().optional()
		})
	);

	const form = createForm(() => ({
		defaultValues: {
			password: ''
		},
		onSubmit: async ({ value }) => {
			const params = {} as Record<string, string>;

			if (credentialsLinked) {
				params.password = value.password!;
			} else if (!isFresh) {
				navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
				return;
			}

			if (deleteUser?.verification) {
				params.callbackURL = `${baseURL}${basePath}/${viewPaths.SIGN_OUT}`;
			}

			try {
				await authClient.deleteUser({
					...params,
					fetchOptions: {
						throw: true
					}
				});

				if (deleteUser?.verification) {
					toast.success(mergedLocalization.DELETE_ACCOUNT_VERIFY!);
				} else {
					toast.success(mergedLocalization.DELETE_ACCOUNT_SUCCESS!);
					navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
				}
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
			}

			onOpenChange?.(false);
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);
</script>

<Dialog.Root {open} {onOpenChange}>
	<Dialog.Content class={cn('sm:max-w-md', classNames?.dialog?.content)}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{mergedLocalization.DELETE_ACCOUNT}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{isFresh
					? mergedLocalization.DELETE_ACCOUNT_INSTRUCTIONS
					: mergedLocalization.SESSION_NOT_FRESH}
			</Dialog.Description>
		</Dialog.Header>

		<Card class={cn('my-2 flex-row p-4', classNames?.cell)}>
			<UserView {user} localization={mergedLocalization} />
		</Card>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="grid gap-6"
		>
			{#if credentialsLinked}
				<form.Field name="password">
					{#snippet children({ state, handleBlur, handleChange })}
						<div class="grid w-full max-w-sm items-center gap-1.5">
							<Label class={classNames?.label}>
								{mergedLocalization.PASSWORD}
							</Label>
							<Input
								autocomplete="current-password"
								placeholder={mergedLocalization.PASSWORD_PLACEHOLDER}
								type="password"
								class={classNames?.input}
								value={state.value ?? ''}
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

			<Dialog.Footer class={classNames?.dialog?.footer}>
				<Button
					type="button"
					variant="secondary"
					class={cn(classNames?.button, classNames?.secondaryButton)}
					onclick={() => onOpenChange?.(false)}
				>
					{mergedLocalization.CANCEL}
				</Button>

				<Button
					class={cn(classNames?.button, classNames?.destructiveButton)}
					disabled={isSubmitting}
					variant="destructive"
					type="submit"
				>
					{#if isSubmitting}
						<Loader2 class="animate-spin" />
					{/if}
					{isFresh ? mergedLocalization.DELETE_ACCOUNT : mergedLocalization.SIGN_OUT}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
