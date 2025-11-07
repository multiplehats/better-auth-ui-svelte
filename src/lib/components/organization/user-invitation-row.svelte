<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
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
		classNames?: SettingsCardClassNames;
		invitation: Invitation;
		localization?: Partial<AuthLocalization>;
		onChanged?: () => unknown;
	}

	let { classNames, invitation, localization: propLocalization, onChanged }: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions, toast } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let isLoading = $state(false);

	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	]);

	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);
	const role = $derived(roles.find((r) => r.role === invitation.role));

	async function handleAccept() {
		isLoading = true;

		try {
			await authClient.organization.acceptInvitation({
				invitationId: invitation.id,
				fetchOptions: { throw: true }
			});

			await onChanged?.();

			toast.success(localization.INVITATION_ACCEPTED);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isLoading = false;
	}

	async function handleReject() {
		isLoading = true;

		try {
			await authClient.organization.rejectInvitation({
				invitationId: invitation.id,
				fetchOptions: { throw: true }
			});

			await onChanged?.();

			toast.success(localization.INVITATION_REJECTED);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isLoading = false;
	}
</script>

<Card.Root class={cn('flex-row items-center p-4', classNames?.cell)}>
	<div class="flex flex-1 items-center gap-2">
		<UserAvatar class="my-0.5" user={{ email: invitation.email }} {localization} />

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

	<div class="flex items-center gap-2">
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
				<DropdownMenu.Item onclick={handleAccept} disabled={isLoading}>
					<CheckIcon class={classNames?.icon} />
					{localization.ACCEPT}
				</DropdownMenu.Item>

				<DropdownMenu.Item onclick={handleReject} disabled={isLoading} variant="destructive">
					<XIcon class={classNames?.icon} />
					{localization.REJECT}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</Card.Root>
