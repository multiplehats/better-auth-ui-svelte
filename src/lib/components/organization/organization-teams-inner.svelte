<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import TeamCell from './team-cell.svelte';
	import CreateTeamDialog from './create-team-dialog.svelte';

	interface Team {
		id: string;
		name: string;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
	}

	/* eslint-disable @typescript-eslint/no-explicit-any */
	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
		organization: Organization;
		filterTeams?: (teams: Team[]) => Team[];
		canCreateTeam?: () => boolean;
		canDeleteTeam?: (team: Team) => boolean;
		canManageMembers?: (team: Team) => boolean;
		filterMembers?: (members: any[]) => any[];
		canRemoveMember?: (member: any) => boolean;
	}

	/* eslint-enable @typescript-eslint/no-explicit-any */

	let {
		className,
		classNames,
		localization,
		organization,
		filterTeams,
		canCreateTeam,
		canDeleteTeam,
		canManageMembers,
		filterMembers,
		canRemoveMember,
	}: Props = $props();

	const config = getAuthUIConfig();
	const { hooks } = config;

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const hasPermissionCreateHook = hooks.useHasPermission({
		organizationId: organization.id,
		permissions: { team: ['create'] }
	} as any);
	const hasPermissionDeleteHook = hooks.useHasPermission({
		organizationId: organization.id,
		permissions: { team: ['delete'] }
	} as any);
	/* eslint-enable @typescript-eslint/no-explicit-any */

	const teamsHook = hooks.useListTeams?.({
		query: { organizationId: organization.id }
	});

	const hasPermissionCreate = $derived(hasPermissionCreateHook?.data);
	const hasPermissionDelete = $derived(hasPermissionDeleteHook?.data);
	const isPending = $derived(
		(hasPermissionCreateHook?.isPending ?? false) || (teamsHook?.isPending ?? false)
	);

	const rawTeams = $derived((teamsHook?.data ?? []) as Team[]);
	const teams = $derived(filterTeams ? filterTeams(rawTeams) : rawTeams);
	const sortedTeams = $derived(
		teams.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
	);

	const showCreateButton = $derived(canCreateTeam ? canCreateTeam() : hasPermissionCreate?.success);

	let createDialogOpen = $state(false);

	function handleTeamChange() {
		teamsHook?.refetch?.();
	}
</script>

<SettingsCard
	{className}
	{classNames}
	title={localization.TEAMS}
	description={localization.TEAMS_DESCRIPTION}
	instructions={localization.TEAMS_INSTRUCTIONS}
	actionLabel={localization.CREATE_TEAM}
	action={() => (createDialogOpen = true)}
	{isPending}
	disabled={!showCreateButton}
>
	{#if !isPending && sortedTeams.length > 0}
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#each sortedTeams as team (team.id)}
				<TeamCell
					{classNames}
					{team}
					{organization}
					{localization}
					hideActions={canDeleteTeam ? !canDeleteTeam(team) : !hasPermissionDelete?.success}
					canManageMembers={canManageMembers ? canManageMembers(team) : true}
					{filterMembers}
					{canRemoveMember}
					onUpdated={handleTeamChange}
					onDeleted={handleTeamChange}
				/>
			{/each}
		</CardContent>
	{:else if !isPending}
		<CardContent>
			<p class="text-sm text-muted-foreground text-center py-4">
				{localization.NO_TEAMS}
			</p>
		</CardContent>
	{/if}
</SettingsCard>

<CreateTeamDialog
	open={createDialogOpen}
	onOpenChange={(open) => (createDialogOpen = open)}
	{classNames}
	{localization}
	{organization}
	onCreated={handleTeamChange}
/>
