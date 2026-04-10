<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import MemberCell from './member-cell.svelte';
	import InviteMemberDialog from './invite-member-dialog.svelte';
	import type { Organization } from 'better-auth/plugins/organization';

	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
		organization: Organization;
	}

	let { className, classNames, localization, organization }: Props = $props();

	const config = getAuthUIConfig();
	const { hooks } = config;

	// Hooks called unconditionally at the top level — organization is guaranteed by the parent.
	/* eslint-disable @typescript-eslint/no-explicit-any */
	const hasPermissionInviteHook = hooks.useHasPermission({
		organizationId: organization.id,
		permissions: { invitation: ['create'] }
	} as any);
	const hasPermissionUpdateMemberHook = hooks.useHasPermission({
		organizationId: organization.id,
		permission: { member: ['update'] }
	} as any);
	/* eslint-enable @typescript-eslint/no-explicit-any */
	const membersHook = hooks.useListMembers({ query: { organizationId: organization.id } });

	const hasPermissionInvite = $derived(hasPermissionInviteHook?.data);
	const hasPermissionUpdateMember = $derived(hasPermissionUpdateMemberHook?.data);
	const isPendingInvite = $derived(hasPermissionInviteHook?.isPending ?? false);
	const isPendingUpdateMember = $derived(hasPermissionUpdateMemberHook?.isPending ?? false);
	const isPending = $derived(isPendingInvite || isPendingUpdateMember);

	const membersData = $derived(membersHook?.data);
	const members = $derived(membersData?.members);
	const sortedMembers = $derived(
		members
			?.slice()
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) || []
	);

	let inviteDialogOpen = $state(false);
</script>

<SettingsCard
	{className}
	{classNames}
	title={localization.MEMBERS}
	description={localization.MEMBERS_DESCRIPTION}
	instructions={localization.MEMBERS_INSTRUCTIONS}
	actionLabel={localization.INVITE_MEMBER}
	action={() => (inviteDialogOpen = true)}
	{isPending}
	disabled={!hasPermissionInvite?.success}
>
	{#if !isPending && members && members.length > 0}
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#each sortedMembers as member (member.id)}
				<MemberCell
					{classNames}
					{member}
					{localization}
					hideActions={!hasPermissionUpdateMember?.success}
				/>
			{/each}
		</CardContent>
	{/if}
</SettingsCard>

<InviteMemberDialog
	open={inviteDialogOpen}
	onOpenChange={(open) => (inviteDialogOpen = open)}
	{classNames}
	{localization}
	{organization}
/>
