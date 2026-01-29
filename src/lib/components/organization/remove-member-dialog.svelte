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
	import * as Card from '$lib/components/ui/card/index.js';
	import UserView from '../user-view.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		member: Member & { user?: Partial<User> | null };
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		classNames,
		localization: propLocalization,
		member,
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const toast = config.toast;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// Get the refetch function from the useListMembers hook
	// svelte-ignore state_referenced_locally -- member prop initializes members hook
	const membersStore = config.hooks.useListMembers({
		query: { organizationId: member.organizationId }
	});
	const refetch = $derived(membersStore.refetch);

	let isRemoving = $state(false);

	async function removeMember() {
		isRemoving = true;

		try {
			await authClient.organization.removeMember({
				memberIdOrEmail: member.id,
				organizationId: member.organizationId,
				fetchOptions: { throw: true }
			});

			toast.success(localization.REMOVE_MEMBER_SUCCESS);

			await refetch?.();

			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isRemoving = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.REMOVE_MEMBER}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.REMOVE_MEMBER_CONFIRM}
			</Dialog.Description>
		</Dialog.Header>

		<Card.Root class={cn('flex-row items-center p-4', classNames?.cell)}>
			<UserView user={member.user} {localization} className="flex-1" />
		</Card.Root>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="outline"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.outlineButton)}
				disabled={isRemoving}
			>
				{localization.CANCEL}
			</Button>

			<Button
				type="button"
				variant="destructive"
				onclick={removeMember}
				class={cn(classNames?.button, classNames?.destructiveButton)}
				disabled={isRemoving}
			>
				{#if isRemoving}
					<Loader2 class="animate-spin" />
				{/if}

				{localization.REMOVE_MEMBER}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
