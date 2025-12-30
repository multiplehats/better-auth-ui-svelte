<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import DeleteOrganizationDialog from './delete-organization-dialog.svelte';

	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: Partial<AuthLocalization>;
		organization: Organization;
	}

	let { className, classNames, localization: propLocalization, organization }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const { useHasPermission } = config.hooks;

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	// Check if user has permission to delete the organization
	const permissionResult = useHasPermission({
		organizationId: organization.id,
		permissions: {
			organization: ['delete']
		}
	} as Parameters<typeof useHasPermission>[0]);

	const hasPermission = $derived(permissionResult.data?.success ?? false);
	const isPending = $derived(permissionResult.isPending ?? false);

	let showDialog = $state(false);
</script>

{#if hasPermission}
	<div>
		<SettingsCard
			{className}
			{classNames}
			actionLabel={mergedLocalization.DELETE_ORGANIZATION}
			description={mergedLocalization.DELETE_ORGANIZATION_DESCRIPTION}
			{isPending}
			title={mergedLocalization.DELETE_ORGANIZATION}
			variant="destructive"
			action={() => (showDialog = true)}
		/>

		<DeleteOrganizationDialog
			{classNames}
			localization={mergedLocalization}
			open={showDialog}
			onOpenChange={(open) => (showDialog = open)}
			{organization}
		/>
	</div>
{/if}
