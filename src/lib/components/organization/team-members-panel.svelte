<script lang="ts">
	import type { User } from 'better-auth';
	import type { Organization } from 'better-auth/plugins/organization';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import TeamMemberCell from './team-member-cell.svelte';
	import AddTeamMemberDialog from './add-team-member-dialog.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
		organization: Organization;
		team: { id: string; name: string; organizationId: string };
		canManageMembers?: boolean;
		filterMembers?: (members: TeamMember[]) => TeamMember[];
		canRemoveMember?: (member: TeamMember) => boolean;
	}

	type TeamMember = {
		id: string;
		teamId: string;
		userId: string;
		createdAt: Date;
		user?: Partial<User> | null;
	};

	let {
		classNames,
		localization,
		organization,
		team,
		canManageMembers = true,
		filterMembers,
		canRemoveMember
	}: Props = $props();

	const config = getAuthUIConfig();
	const { hooks } = config;

	const teamMembersHook = hooks.useListTeamMembers?.({
		query: { teamId: team.id }
	});

	const rawMembers = $derived((teamMembersHook?.data ?? []) as TeamMember[]);
	const members = $derived(filterMembers ? filterMembers(rawMembers) : rawMembers);
	const isPending = $derived(teamMembersHook?.isPending ?? false);
	const existingTeamMemberIds = $derived(rawMembers.map((m) => m.userId));

	let addDialogOpen = $state(false);

	function handleMemberChange() {
		teamMembersHook?.refetch?.();
	}
</script>

<div class={cn('border-t bg-muted/30 p-4 space-y-3')}>
	<div class="flex items-center justify-between">
		<span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
			{localization.MEMBERS}
		</span>
		{#if canManageMembers}
			<Button
				size="sm"
				variant="outline"
				class="h-7 text-xs"
				onclick={() => (addDialogOpen = true)}
			>
				<UserPlusIcon class="size-3.5" />
				{localization.ADD_TEAM_MEMBER}
			</Button>
		{/if}
	</div>

	{#if isPending}
		<div class="space-y-2">
			{#each Array(2) as _}
				<div class="h-12 animate-pulse rounded-md bg-muted"></div>
			{/each}
		</div>
	{:else if members.length === 0}
		<p class="text-sm text-muted-foreground py-2 text-center">
			{localization.NO_TEAM_MEMBERS}
		</p>
	{:else}
		<div class="space-y-2">
			{#each members as member (member.id)}
				<TeamMemberCell
					{classNames}
					teamMember={member}
					{localization}
					hideActions={canRemoveMember ? !canRemoveMember(member) : !canManageMembers}
					onRemoved={handleMemberChange}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if canManageMembers}
	<AddTeamMemberDialog
		open={addDialogOpen}
		onOpenChange={(open) => (addDialogOpen = open)}
		{classNames}
		{localization}
		{organization}
		{team}
		{existingTeamMemberIds}
		onAdded={handleMemberChange}
	/>
{/if}
