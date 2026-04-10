<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import UpdateTeamDialog from './update-team-dialog.svelte';
	import DeleteTeamDialog from './delete-team-dialog.svelte';
	import TeamMembersPanel from './team-members-panel.svelte';

	interface Team {
		id: string;
		name: string;
		organizationId: string;
		createdAt: Date;
		updatedAt: Date;
	}

	/* eslint-disable @typescript-eslint/no-explicit-any */
	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		team: Team;
		organization: Organization;
		localization: AuthLocalization;
		hideActions?: boolean;
		canManageMembers?: boolean;
		filterMembers?: (members: any[]) => any[];
		canRemoveMember?: (member: any) => boolean;
		onUpdated?: () => void;
		onDeleted?: () => void;
	}

	/* eslint-enable @typescript-eslint/no-explicit-any */

	let {
		class: className,
		classNames,
		team,
		organization,
		localization,
		hideActions,
		canManageMembers = true,
		filterMembers,
		canRemoveMember,
		onUpdated,
		onDeleted
	}: Props = $props();

	let expanded = $state(false);
	let updateDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);
</script>

<Card.Root class={cn('overflow-hidden', className, classNames?.cell)}>
	<button
		type="button"
		class="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
		onclick={() => (expanded = !expanded)}
	>
		<UsersIcon class="size-5 shrink-0 text-muted-foreground" />

		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium truncate">{team.name}</p>
			<p class="text-xs text-muted-foreground">
				{new Date(team.createdAt).toLocaleDateString()}
			</p>
		</div>

		{#if !hideActions}
			<!-- Stop propagation so dropdown doesn't toggle accordion -->
			<div onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								class={cn('relative', classNames?.button, classNames?.outlineButton)}
								size="icon"
								type="button"
								variant="outline"
							>
								<EllipsisIcon class={classNames?.icon} />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
						<DropdownMenu.Item onclick={() => (updateDialogOpen = true)}>
							<PencilIcon class={classNames?.icon} />
							{localization.RENAME_TEAM}
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => (deleteDialogOpen = true)}
							variant="destructive"
						>
							<Trash2Icon class={classNames?.icon} />
							{localization.DELETE_TEAM}
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		{/if}

		<ChevronDownIcon
			class={cn(
				'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
				expanded && 'rotate-180'
			)}
		/>
	</button>

	{#if expanded}
		<TeamMembersPanel
			{classNames}
			{localization}
			{organization}
			{team}
			{canManageMembers}
			{filterMembers}
			{canRemoveMember}
		/>
	{/if}
</Card.Root>

<UpdateTeamDialog
	open={updateDialogOpen}
	onOpenChange={(open) => (updateDialogOpen = open)}
	{team}
	{classNames}
	{localization}
	{onUpdated}
/>

<DeleteTeamDialog
	open={deleteDialogOpen}
	onOpenChange={(open) => (deleteDialogOpen = open)}
	{team}
	{classNames}
	{localization}
	{onDeleted}
/>
