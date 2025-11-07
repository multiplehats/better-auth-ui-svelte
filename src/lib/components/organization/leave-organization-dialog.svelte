<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type { Organization } from 'better-auth/plugins/organization';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import OrganizationCellView from './organization-cell-view.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		organization: Organization;
		localization?: Partial<AuthLocalization>;
	}

	let {
		class: className,
		classNames,
		open = $bindable(false),
		onOpenChange,
		organization,
		localization: propLocalization
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { useListOrganizations } = config.hooks;
	const toast = config.toast;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const organizationsStore = useListOrganizations() as ReturnType<typeof useListOrganizations> & {
		subscribe: Function;
	};
	const organizationsResult = $derived($organizationsStore);
	const refetchOrganizations = $derived(
		organizationsResult && 'refetch' in organizationsResult
			? organizationsResult.refetch
			: undefined
	);

	let isLeaving = $state(false);

	async function handleLeaveOrganization() {
		isLeaving = true;

		try {
			await authClient.organization.leave({
				organizationId: organization.id,
				fetchOptions: { throw: true }
			});

			refetchOrganizations?.();

			toast.success(localization.LEAVE_ORGANIZATION_SUCCESS);

			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isLeaving = false;
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
				{localization.LEAVE_ORGANIZATION}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.LEAVE_ORGANIZATION_CONFIRM}
			</Dialog.Description>
		</Dialog.Header>

		<Card.Root class={cn('my-2 flex-row p-4', className, classNames?.cell)}>
			<OrganizationCellView {organization} {localization} />
		</Card.Root>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="outline"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.outlineButton)}
				disabled={isLeaving}
			>
				{localization.CANCEL}
			</Button>

			<Button
				type="button"
				variant="destructive"
				onclick={handleLeaveOrganization}
				class={cn(classNames?.button, classNames?.destructiveButton)}
				disabled={isLeaving}
			>
				{#if isLeaving}
					<Loader2 class="animate-spin" />
				{/if}

				{localization.LEAVE_ORGANIZATION}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
