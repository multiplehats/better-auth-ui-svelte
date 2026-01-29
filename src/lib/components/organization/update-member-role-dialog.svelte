<script lang="ts">
	import type { User } from 'better-auth';
	import type { Member } from 'better-auth/plugins/organization';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import MemberCell from './member-cell.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		member: Member & { user?: Partial<User> | null };
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		member,
		classNames,
		localization: propLocalization,
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const {
		hooks: { useSession, useListMembers },
		organization: organizationOptions,
		toast
	} = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// svelte-ignore state_referenced_locally -- member prop initializes members hook
	const membersHook = useListMembers({
		query: { organizationId: member.organizationId }
	});
	const membersData = $derived(membersHook?.data);
	const members = $derived(membersData?.members);
	const refetchMembers = membersHook?.refetch;

	const sessionHook = useSession();
	const sessionData = $derived($sessionHook.data);

	let isUpdating = $state(false);
	// svelte-ignore state_referenced_locally -- member prop initializes selected role state
	let selectedRole = $state(member.role);

	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	]);

	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);

	const currentUserRole = $derived(
		members?.find(
			(m: Member & { user?: Partial<User> | null }) => m.user?.id === sessionData?.user.id
		)?.role
	);

	const availableRoles = $derived(
		roles.filter((role) => {
			if (role.role === 'owner') {
				return currentUserRole === 'owner';
			}

			if (role.role === 'admin') {
				return currentUserRole === 'owner' || currentUserRole === 'admin';
			}

			return true;
		})
	);

	async function updateMemberRole() {
		if (selectedRole === member.role) {
			toast.error(`${localization.ROLE} ${localization.IS_THE_SAME}`);
			return;
		}

		isUpdating = true;

		try {
			await authClient.organization.updateMemberRole({
				memberId: member.id,
				role: selectedRole,
				organizationId: member.organizationId,
				fetchOptions: {
					throw: true
				}
			});

			toast.success(localization.MEMBER_ROLE_UPDATED);

			await refetchMembers?.();

			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isUpdating = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}

	// Reset selected role when dialog opens
	$effect(() => {
		if (open) {
			selectedRole = member.role;
		}
	});
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.UPDATE_ROLE}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.UPDATE_ROLE_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<MemberCell {member} {localization} hideActions />

			<Select.Root
				type="single"
				value={selectedRole}
				onValueChange={(value: string | undefined) => {
					if (value) {
						selectedRole = value;
					}
				}}
			>
				<Select.Trigger class="w-full">
					{availableRoles.find((r) => r.role === selectedRole)?.label || selectedRole}
				</Select.Trigger>

				<Select.Content>
					{#each availableRoles as role (role.role)}
						<Select.Item value={role.role} label={role.label}>
							{role.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="outline"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.outlineButton)}
				disabled={isUpdating}
			>
				{localization.CANCEL}
			</Button>

			<Button
				type="button"
				onclick={updateMemberRole}
				class={cn(classNames?.button, classNames?.primaryButton)}
				disabled={isUpdating}
			>
				{#if isUpdating}
					<Loader2 class="animate-spin" />
				{/if}

				{localization.UPDATE_ROLE}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
