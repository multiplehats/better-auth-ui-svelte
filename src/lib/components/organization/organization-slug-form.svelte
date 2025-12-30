<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';

	export interface OrganizationSlugFormProps {
		organization: Organization;
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
	}

	type Props = OrganizationSlugFormProps;

	let { organization, className, classNames, localization }: Props = $props();

	const {
		hooks: { useHasPermission },
		mutators: { updateOrganization },
		optimistic,
		toast,
		organization: organizationOptions,
		replace
	} = getAuthUIConfig();

	const { refetch: refetchOrganization } = useCurrentOrganization({
		slug: organization.slug
	});

	const permissionStore = useHasPermission({
		organizationId: organization.id,
		permissions: {
			organization: ['update']
		}
	});

	const hasPermissionData = $derived(permissionStore?.data);
	const hasPermission = $derived(hasPermissionData?.success ?? false);
	const permissionPending = $derived(permissionStore?.isPending ?? false);

	const formSchema = z.object({
		slug: z
			.string()
			.min(1, {
				message: `${localization.ORGANIZATION_SLUG} ${localization.IS_REQUIRED}`
			})
			.regex(/^[a-z0-9-]+$/, {
				message: `${localization.ORGANIZATION_SLUG} ${localization.IS_INVALID}`
			})
	});

	const form = createForm(() => ({
		defaultValues: {
			slug: organization.slug || ''
		},
		onSubmit: async ({ value: values }) => {
			// Add small delay
			await new Promise((resolve) => setTimeout(resolve, 10));

			if (organization.slug === values.slug) {
				toast.error(`${localization.ORGANIZATION_SLUG} ${localization.IS_THE_SAME}`);
				return;
			}

			try {
				await updateOrganization({
					organizationId: organization.id,
					data: { slug: values.slug }
				});

				refetchOrganization?.();

				toast.success(`${localization.ORGANIZATION_SLUG} ${localization.UPDATED_SUCCESSFULLY}`);

				// If using slug-based paths, redirect to the new slug's settings route
				if (organizationOptions?.pathMode === 'slug') {
					const basePath = organizationOptions.basePath;
					const settingsPath = organizationOptions.viewPaths.SETTINGS;
					replace(`${basePath}/${values.slug}/${settingsPath}`);
				}
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<SettingsCard
		{className}
		{classNames}
		description={localization.ORGANIZATION_SLUG_DESCRIPTION}
		instructions={localization.ORGANIZATION_SLUG_INSTRUCTIONS}
		isPending={permissionPending}
		title={localization.ORGANIZATION_SLUG}
		actionLabel={localization.SAVE}
		{optimistic}
		disabled={!hasPermission}
	>
		<CardContent class={classNames?.content}>
			{#if permissionPending}
				<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
			{:else}
				<form.Field name="slug" validators={{ onChange: formSchema.shape.slug }}>
					{#snippet children({ state, handleBlur, handleChange })}
						<div class="grid w-full items-center gap-1.5">
							<Input
								class={classNames?.input}
								type="text"
								placeholder={localization.ORGANIZATION_SLUG_PLACEHOLDER}
								disabled={isSubmitting || !hasPermission}
								value={state.value as string}
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
