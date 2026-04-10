<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import OrganizationTeamsInner from './organization-teams-inner.svelte';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	export interface OrganizationTeamsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
		filterTeams?: (teams: any[]) => any[];
		canCreateTeam?: () => boolean;
		canDeleteTeam?: (team: any) => boolean;
		canManageMembers?: (team: any) => boolean;
		filterMembers?: (members: any[]) => any[];
		canRemoveMember?: (member: any) => boolean;
	}

	/* eslint-enable @typescript-eslint/no-explicit-any */

	type Props = OrganizationTeamsCardProps;

	let {
		className,
		classNames,
		localization: propLocalization,
		slug: slugProp,
		filterTeams,
		canCreateTeam,
		canDeleteTeam,
		canManageMembers,
		filterMembers,
		canRemoveMember,
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const slug = slugProp || organizationOptions?.slug;

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
</script>

{#if !organization}
	<SettingsCard
		{className}
		{classNames}
		title={localization.TEAMS}
		description={localization.TEAMS_DESCRIPTION}
		instructions={localization.TEAMS_INSTRUCTIONS}
		actionLabel={localization.CREATE_TEAM}
		isPending
	/>
{:else}
	<OrganizationTeamsInner
		{className}
		{classNames}
		{localization}
		{organization}
		{filterTeams}
		{canCreateTeam}
		{canDeleteTeam}
		{canManageMembers}
		{filterMembers}
		{canRemoveMember}
	/>
{/if}
