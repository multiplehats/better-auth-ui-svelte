<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import OrganizationCellView from './organization-cell-view.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		organization: Organization;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		classNames,
		localization: propLocalization,
		organization,
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const accountOptions = config.account;
	const navigate = config.navigate;
	const toast = config.toast;
	const { useListOrganizations } = config.hooks;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const organizationsStore = useListOrganizations() as ReturnType<typeof useListOrganizations> & {
		subscribe: Function;
	};
	const organizationsResult = $derived($organizationsStore);
	const refetchOrganizations = $derived(
		organizationsResult && 'refetch' in organizationsResult
			? organizationsResult.refetch
			: undefined
	);

	// Form validation schema
	const formSchema = $derived(
		z.object({
			slug: z
				.string()
				.min(1, { message: localization.SLUG_REQUIRED! })
				.refine((val) => val === organization.slug, {
					message: localization.SLUG_DOES_NOT_MATCH!
				})
		})
	);

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			slug: ''
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.organization.delete({
					organizationId: organization.id,
					fetchOptions: { throw: true }
				});

				// Refetch organizations list
				await refetchOrganizations?.();

				toast.success(localization.DELETE_ORGANIZATION_SUCCESS!);

				navigate(`${accountOptions?.basePath}/${accountOptions?.viewPaths.ORGANIZATIONS}`);

				onOpenChange?.(false);
				open = false;
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
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
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={cn('sm:max-w-md', classNames?.dialog?.content)}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.DELETE_ORGANIZATION}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.DELETE_ORGANIZATION_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		<Card class={cn('my-2 flex-row p-4', classNames?.cell)}>
			<OrganizationCellView {organization} {localization} />
		</Card>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="grid gap-6"
		>
			<form.Field name="slug" validators={{ onChange: formSchema.shape.slug }}>
				{#snippet children(field)}
					<div class="grid w-full items-center gap-1.5">
						<Label class={classNames?.label}>
							{localization.DELETE_ORGANIZATION_INSTRUCTIONS}
							<span class="font-bold">
								{organization.slug}
							</span>
						</Label>

						<Input
							placeholder={organization.slug}
							class={classNames?.input}
							autocomplete="off"
							value={field.state.value}
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
					class={cn(classNames?.button, classNames?.secondaryButton)}
					onclick={() => handleOpenChange(false)}
				>
					{localization.CANCEL}
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
					{localization.DELETE_ORGANIZATION}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
