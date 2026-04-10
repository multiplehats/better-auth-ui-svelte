<script lang="ts">
	import type { User } from 'better-auth';
	import UserXIcon from '@lucide/svelte/icons/user-x';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import UserView from '../user-view.svelte';
	import RemoveTeamMemberDialog from './remove-team-member-dialog.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		teamMember: { id: string; teamId: string; userId: string; user?: Partial<User> | null };
		localization?: Partial<AuthLocalization>;
		hideActions?: boolean;
		onRemoved?: () => void;
	}

	let {
		class: className,
		classNames,
		teamMember,
		localization,
		hideActions,
		onRemoved
	}: Props = $props();

	let removeDialogOpen = $state(false);
</script>

<Card.Root class={cn('flex-row items-center p-3', className, classNames?.cell)}>
	<UserView user={teamMember.user} {localization} className="flex-1" />

	{#if !hideActions}
		<Button
			size="icon"
			variant="ghost"
			class="size-8 text-muted-foreground hover:text-destructive"
			onclick={() => (removeDialogOpen = true)}
		>
			<UserXIcon class="size-4" />
		</Button>
	{/if}
</Card.Root>

<RemoveTeamMemberDialog
	open={removeDialogOpen}
	onOpenChange={(open) => (removeDialogOpen = open)}
	{teamMember}
	{classNames}
	{localization}
	{onRemoved}
/>
