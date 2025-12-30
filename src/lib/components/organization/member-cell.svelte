<script lang="ts">
	import type { User } from 'better-auth';
	import type { Member, Organization } from 'better-auth/plugins/organization';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import UserCogIcon from '@lucide/svelte/icons/user-cog';
	import UserXIcon from '@lucide/svelte/icons/user-x';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import UserView from '../user-view.svelte';
	import LeaveOrganizationDialog from './leave-organization-dialog.svelte';
	import RemoveMemberDialog from './remove-member-dialog.svelte';
	import UpdateMemberRoleDialog from './update-member-role-dialog.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		member: Member & { user?: Partial<User> | null };
		localization?: Partial<AuthLocalization>;
		hideActions?: boolean;
	}

	let {
		class: className,
		classNames,
		member,
		localization: propLocalization,
		hideActions
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const {
		organization: organizationOptions,
		hooks: { useListMembers, useSession, useListOrganizations, useHasPermission }
	} = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionHook = useSession();
	const sessionData = $derived($sessionHook.data);

	let removeDialogOpen = $state(false);
	let leaveDialogOpen = $state(false);
	let updateRoleDialogOpen = $state(false);

	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	]);

	const membersHook = useListMembers({
		query: { organizationId: member.organizationId }
	});
	const membersData = $derived(membersHook?.data);
	const members = $derived(membersData?.members);

	const myRole = $derived(
		members?.find(
			(m: Member & { user?: Partial<User> | null }) => m.user?.id === sessionData?.user.id
		)?.role
	);

	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);
	const role = $derived(roles.find((r) => r.role === member.role));

	const isSelf = $derived(sessionData?.user.id === member?.userId);

	const organizationsHook = useListOrganizations() as ReturnType<typeof useListOrganizations> & {
		subscribe: (fn: (value: unknown) => void) => () => void;
	};
	const organizationsResult = $derived($organizationsHook);
	const organizations = $derived(organizationsResult?.data);
	const organization = $derived(
		organizations?.find((org: Organization) => org.id === member.organizationId)
	);

	const hasPermissionHook = useHasPermission({
		organizationId: member.organizationId,
		permission: { member: ['update'] }
	});
	const hasPermissionToUpdateMember = $derived(hasPermissionHook?.data);
</script>

<Card.Root class={cn('flex-row items-center p-4', className, classNames?.cell)}>
	<UserView user={member.user} {localization} className="flex-1" />

	<span class="text-xs opacity-70">{role?.label}</span>

	{#if !hideActions && (isSelf || member.role !== 'owner' || myRole === 'owner')}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
						size="icon"
						type="button"
						variant="outline"
					>
						<EllipsisIcon class={classNames?.icon} />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
				{#if hasPermissionToUpdateMember?.success}
					<DropdownMenu.Item onclick={() => (updateRoleDialogOpen = true)}>
						<UserCogIcon class={classNames?.icon} />
						{localization?.UPDATE_ROLE}
					</DropdownMenu.Item>
				{/if}

				<DropdownMenu.Item
					onclick={() => (isSelf ? (leaveDialogOpen = true) : (removeDialogOpen = true))}
					variant="destructive"
				>
					<UserXIcon class={classNames?.icon} />
					{isSelf ? localization?.LEAVE_ORGANIZATION : localization?.REMOVE_MEMBER}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/if}
</Card.Root>

<RemoveMemberDialog
	open={removeDialogOpen}
	onOpenChange={(open) => (removeDialogOpen = open)}
	{member}
	{classNames}
	{localization}
/>

{#if organization}
	<LeaveOrganizationDialog
		open={leaveDialogOpen}
		onOpenChange={(open) => (leaveDialogOpen = open)}
		{organization}
		{classNames}
		{localization}
	/>
{/if}

<UpdateMemberRoleDialog
	open={updateRoleDialogOpen}
	onOpenChange={(open) => (updateRoleDialogOpen = open)}
	{member}
	{classNames}
	{localization}
/>
