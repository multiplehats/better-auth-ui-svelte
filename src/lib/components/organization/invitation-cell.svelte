<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import XIcon from '@lucide/svelte/icons/x';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { Invitation } from '$lib/types/invitation.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import UserAvatar from '../user-avatar.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		invitation: Invitation;
		localization?: Partial<AuthLocalization>;
		organization: Organization;
	}

	let {
		class: className,
		classNames,
		invitation,
		localization: propLocalization,
		organization
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const {
		hooks: { useListInvitations },
		organization: organizationOptions,
		toast
	} = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let isLoading = $state(false);

	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	]);

	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);
	const role = $derived(roles.find((r) => r.role === invitation.role));

	const invitationsHook = useListInvitations({
		query: { organizationId: organization?.id }
	});
	const refetch = invitationsHook?.refetch;

	async function handleCancelInvitation() {
		isLoading = true;

		try {
			await authClient.organization.cancelInvitation({
				invitationId: invitation.id,
				fetchOptions: { throw: true }
			});

			await refetch?.();

			toast.success(localization.INVITATION_CANCELLED);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isLoading = false;
	}
</script>

<Card.Root class={cn('flex-row items-center p-4', className, classNames?.cell)}>
	<div class="flex flex-1 items-center gap-2">
		<UserAvatar class="my-0.5" user={invitation} {localization} />

		<div class="grid flex-1 text-left leading-tight">
			<span class="truncate text-sm font-semibold">
				{invitation.email}
			</span>

			<span class="truncate text-xs text-muted-foreground">
				{localization.EXPIRES}
				{invitation.expiresAt.toLocaleDateString()}
			</span>
		</div>
	</div>

	<span class="truncate text-sm opacity-70">{role?.label}</span>

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
					disabled={isLoading}
					size="icon"
					type="button"
					variant="outline"
				>
					{#if isLoading}
						<Loader2 class="animate-spin" />
					{:else}
						<EllipsisIcon class={classNames?.icon} />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
			<DropdownMenu.Item
				onclick={handleCancelInvitation}
				disabled={isLoading}
				variant="destructive"
			>
				<XIcon class={classNames?.icon} />
				{localization.CANCEL_INVITATION}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Card.Root>
