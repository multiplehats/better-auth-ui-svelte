<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import { createForm } from '@tanstack/svelte-form';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import SettingsCard, {
		type SettingsCardClassNames
	} from '../settings/shared/settings-card.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';

	export interface OrganizationNameFormProps {
		organization: Organization;
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
	}

	interface Props extends OrganizationNameFormProps {}

	let { organization, className, classNames, localization, ...restProps }: Props = $props();

	const {
		hooks: { useHasPermission },
		mutators: { updateOrganization },
		optimistic,
		toast
	} = getAuthUIConfig();

	const { refetch: refetchOrganization } = useCurrentOrganization({
		slug: organization.slug
	});

	const permissionStore = useHasPermission({
		organizationId: organization.id,
		permissions: {
			organization: ['update']
		}
	} as any);

	const hasPermissionData = $derived(permissionStore?.data);
	const hasPermission = $derived(hasPermissionData?.success ?? false);
	const permissionPending = $derived(permissionStore?.isPending ?? false);

	const isPending = $derived(permissionPending);

	// Form setup
	const form = createForm(() => ({
		defaultValues: {
			name: organization.name || ''
		},
		onSubmit: async ({ value: values }) => {
			// Add small delay for better UX
			await new Promise((resolve) => setTimeout(resolve, 10));

			const newName = values.name;

			if (organization.name === newName) {
				toast.error(`${localization.ORGANIZATION_NAME} ${localization.IS_THE_SAME}`);
				return;
			}

			// Validate name is not empty
			if (!newName || newName.trim().length === 0) {
				form.setFieldMeta('name', (prev) => ({
					...prev,
					errors: [`${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`]
				}));
				return;
			}

			try {
				await updateOrganization({
					organizationId: organization.id,
					data: { name: newName }
				});

				await refetchOrganization?.();

				toast.success(`${localization.ORGANIZATION_NAME} ${localization.UPDATED_SUCCESSFULLY}`);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	// Update form values when organization changes
	$effect(() => {
		if (organization?.name !== undefined) {
			form.setFieldValue('name', organization.name || '');
		}
	});
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
		description={localization.ORGANIZATION_NAME_DESCRIPTION}
		instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
		{isPending}
		title={localization.ORGANIZATION_NAME}
		actionLabel={localization.SAVE}
		{optimistic}
		disabled={!hasPermission}
		{...restProps}
	>
		<CardContent class={classNames?.content}>
			{#if isPending}
				<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
			{:else}
				<form.Field name="name">
					{#snippet children({ state, handleBlur, handleChange })}
						<div class="grid w-full items-center gap-1.5">
							<Input
								class={classNames?.input}
								type="text"
								placeholder={localization.ORGANIZATION_NAME_PLACEHOLDER}
								disabled={isSubmitting || !hasPermission}
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
