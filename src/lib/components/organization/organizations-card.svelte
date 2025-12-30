<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import { fromStore } from '$lib/utils/store-to-rune.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import SettingsCellSkeleton from '../settings/skeletons/settings-cell-skeleton.svelte';
	import OrganizationCell from './organization-cell.svelte';
	import CreateOrganizationDialog from './create-organization-dialog.svelte';

	export interface OrganizationsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	type Props = OrganizationsCardProps;

	let { className, classNames, localization }: Props = $props();

	const {
		hooks: { useListOrganizations },
		localization: contextLocalization
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...localization };

	const organizationsStore = useListOrganizations();
	const organizationsResult = fromStore(organizationsStore);

	// Derive reactive values from the store
	const organizationsData = $derived(organizationsResult.value?.data ?? null);
	const organizationsPending = $derived(organizationsResult.value?.isPending ?? false);

	let createDialogOpen = $state(false);
</script>

<SettingsCard
	{className}
	{classNames}
	title={mergedLocalization.ORGANIZATIONS}
	description={mergedLocalization.ORGANIZATIONS_DESCRIPTION}
	instructions={mergedLocalization.ORGANIZATIONS_INSTRUCTIONS}
	actionLabel={mergedLocalization.CREATE_ORGANIZATION}
	action={() => (createDialogOpen = true)}
	isPending={organizationsPending}
>
	<CardContent class={cn('grid gap-4', classNames?.content)}>
		{#if organizationsPending}
			<SettingsCellSkeleton {classNames} />
		{/if}
		{#if organizationsData}
			{#each organizationsData as organization (organization.id)}
				<OrganizationCell {classNames} {organization} localization={mergedLocalization} />
			{/each}
		{/if}
	</CardContent>
</SettingsCard>

<CreateOrganizationDialog
	{classNames}
	localization={mergedLocalization}
	open={createDialogOpen}
	onOpenChange={(open) => (createDialogOpen = open)}
/>
