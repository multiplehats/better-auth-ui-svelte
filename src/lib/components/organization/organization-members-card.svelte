<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import MemberCell from './member-cell.svelte';
	import InviteMemberDialog from './invite-member-dialog.svelte';

	export interface OrganizationMembersCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationMembersCardProps;

	let { className, classNames, localization: propLocalization, slug: slugProp }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions, hooks } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// svelte-ignore state_referenced_locally -- slug prop initializes organization hook
	const slug = slugProp || organizationOptions?.slug;

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);

	let inviteDialogOpen = $state(false);

	// Only call hooks when we have an organization
	const hasPermissionInviteHook = $derived(
		organization
			? hooks.useHasPermission({
					organizationId: organization.id,
					permissions: {
						invitation: ['create']
					}
				})
			: null
	);
	const hasPermissionUpdateMemberHook = $derived(
		organization
			? hooks.useHasPermission({
					organizationId: organization.id,
					permission: {
						member: ['update']
					}
				})
			: null
	);
	const hasPermissionInvite = $derived(hasPermissionInviteHook?.data);
	const hasPermissionUpdateMember = $derived(hasPermissionUpdateMemberHook?.data);
	const isPendingInvite = $derived(hasPermissionInviteHook?.isPending ?? false);
	const isPendingUpdateMember = $derived(hasPermissionUpdateMemberHook?.isPending ?? false);
	const isPending = $derived(isPendingInvite || isPendingUpdateMember);

	const membersHook = $derived(
		organization ? hooks.useListMembers({ query: { organizationId: organization.id } }) : null
	);
	const membersData = $derived(membersHook?.data);
	const members = $derived(membersData?.members);
	const sortedMembers = $derived(
		members
			?.slice()
			.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) || []
	);
</script>

{#if !organization}
	<SettingsCard
		{className}
		{classNames}
		title={localization.MEMBERS}
		description={localization.MEMBERS_DESCRIPTION}
		instructions={localization.MEMBERS_INSTRUCTIONS}
		actionLabel={localization.INVITE_MEMBER}
		isPending
	/>
{:else}
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
{/if}
