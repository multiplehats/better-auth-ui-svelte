<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import PasswordInput from '$lib/components/password-input.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import BackupCodesDialog from './backup-codes-dialog.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		isTwoFactorEnabled: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { classNames, isTwoFactorEnabled, open = $bindable(false), onOpenChange }: Props = $props();

	const localization = getLocalization();
	const authClient = getAuthClient();
	const config = getAuthUIConfig();

	const basePath = config.basePath;
	const viewPaths = config.viewPaths;
	const navigate = config.navigate;
	const toast = config.toast;
	const twoFactor = config.twoFactor;

	let showBackupCodesDialog = $state(false);
	let backupCodes = $state<string[]>([]);
	let totpURI = $state<string | null>(null);

	// Form validation schema
	const formSchema = $derived(
		z.object({
			password: z.string().min(1, { message: localization.PASSWORD_REQUIRED })
		})
	);

	// Enable two factor
	async function enableTwoFactor(password: string) {
		try {
			const response = await authClient.twoFactor.enable({
				password,
				fetchOptions: { throw: true }
			});

			handleOpenChange(false);
			backupCodes = response.backupCodes;

			if (twoFactor?.includes('totp')) {
				totpURI = response.totpURI;
			}

			setTimeout(() => {
				showBackupCodesDialog = true;
			}, 250);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}
	}

	// Disable two factor
	async function disableTwoFactor(password: string) {
		try {
			await authClient.twoFactor.disable({
				password,
				fetchOptions: { throw: true }
			});

			toast.success(localization.TWO_FACTOR_DISABLED);
			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}
	}

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			password: ''
		},
		onSubmit: async ({ value }) => {
			if (isTwoFactorEnabled) {
				await disableTwoFactor(value.password);
			} else {
				await enableTwoFactor(value.password);
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);

		// Reset form when dialog closes
		if (!newOpen) {
			form.reset();
		}
	}

	function handleBackupCodesOpenChange(newOpen: boolean) {
		showBackupCodesDialog = newOpen;

		if (!newOpen) {
			const url = `${basePath}/${viewPaths.TWO_FACTOR}`;
			navigate(twoFactor?.includes('totp') && totpURI ? `${url}?totpURI=${totpURI}` : url);
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={cn('sm:max-w-md', classNames?.dialog?.content)}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={classNames?.title}>
				{localization.TWO_FACTOR}
			</Dialog.Title>

			<Dialog.Description class={classNames?.description}>
				{isTwoFactorEnabled
					? localization.TWO_FACTOR_DISABLE_INSTRUCTIONS
					: localization.TWO_FACTOR_ENABLE_INSTRUCTIONS}
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="grid gap-4"
		>
			<form.Field name="password" validators={{ onChange: formSchema.shape.password }}>
				{#snippet children(field)}
					<div class="grid w-full items-center gap-1.5">
						<Label class={classNames?.label}>
							{localization.PASSWORD}
						</Label>

						<PasswordInput
							class={classNames?.input}
							placeholder={localization.PASSWORD_PLACEHOLDER}
							autocomplete="current-password"
							bind:value={field.state.value}
							onblur={field.handleBlur}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
						/>

						{#if field.state.meta.errors.length > 0}
							<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
								{getFieldError(field.state.meta.errors[0])}
							</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer class={classNames?.dialog?.footer}>
				<Button
					type="button"
					variant="secondary"
					onclick={() => handleOpenChange(false)}
					class={cn(classNames?.button, classNames?.secondaryButton)}
				>
					{localization.CANCEL}
				</Button>

				<Button
					type="submit"
					disabled={isSubmitting}
					class={cn(classNames?.button, classNames?.primaryButton)}
				>
					{#if isSubmitting}
						<Loader2 class="animate-spin" />
					{/if}
					{isTwoFactorEnabled ? localization.DISABLE_TWO_FACTOR : localization.ENABLE_TWO_FACTOR}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<BackupCodesDialog
	{classNames}
	{backupCodes}
	open={showBackupCodesDialog}
	onOpenChange={handleBackupCodesOpenChange}
/>
