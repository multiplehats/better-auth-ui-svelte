<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SettingsIcon from '@lucide/svelte/icons/settings';
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
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import LeaveOrganizationDialog from './leave-organization-dialog.svelte';
	import OrganizationCellView from './organization-cell-view.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		organization: Organization;
		localization?: Partial<AuthLocalization>;
	}

	let {
		class: className,
		classNames,
		organization,
		localization: propLocalization
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions, navigate, toast } = config;
	const { pathMode } = organizationOptions || {};

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let isLeaveDialogOpen = $state(false);
	let isManagingOrganization = $state(false);

	async function handleManageOrganization() {
		isManagingOrganization = true;

		if (pathMode === 'slug') {
			navigate(
				`${organizationOptions?.basePath}/${organization.slug}/${organizationOptions?.viewPaths.SETTINGS}`
			);

			return;
		}

		try {
			await authClient.organization.setActive({
				organizationId: organization.id,
				fetchOptions: {
					throw: true
				}
			});

			navigate(`${organizationOptions?.basePath}/${organizationOptions?.viewPaths?.SETTINGS}`);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));

			isManagingOrganization = false;
		}
	}
</script>

<Card.Root class={cn('flex-row p-4', className, classNames?.cell)}>
	<OrganizationCellView {organization} {localization} />

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
					disabled={isManagingOrganization}
					size="icon"
					type="button"
					variant="outline"
				>
					{#if isManagingOrganization}
						<Loader2 class="animate-spin" />
					{:else}
						<EllipsisIcon class={classNames?.icon} />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
			<DropdownMenu.Item onclick={handleManageOrganization} disabled={isManagingOrganization}>
				<SettingsIcon class={classNames?.icon} />

				{localization.MANAGE_ORGANIZATION}
			</DropdownMenu.Item>

			<DropdownMenu.Item onclick={() => (isLeaveDialogOpen = true)} variant="destructive">
				<LogOutIcon class={classNames?.icon} />

				{localization.LEAVE_ORGANIZATION}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Card.Root>

<LeaveOrganizationDialog
	open={isLeaveDialogOpen}
	onOpenChange={(open) => (isLeaveDialogOpen = open)}
	{organization}
	{localization}
/>
