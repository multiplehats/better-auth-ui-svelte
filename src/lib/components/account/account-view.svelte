<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { AccountViewPath } from '$lib/utils/view-paths.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';

	export interface AccountViewProps {
		className?: string;
		classNames?: {
			base?: string;
			cards?: string;
			drawer?: { menuItem?: string };
			sidebar?: { base?: string; button?: string; buttonActive?: string };
			card?: SettingsCardClassNames;
		};
		localization?: Partial<AuthLocalization>;
		path?: string;
		pathname?: string;
		view?: AccountViewPath;
		hideNav?: boolean;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getViewByPath } from '$lib/utils/utils.js';
	import { useAuthenticate } from '$lib/hooks/use-authenticate.svelte.js';
	import { AccountSettingsCards } from '../settings/account/index.js';
	// TODO: Import SecuritySettingsCards when security directory is ported
	// import SecuritySettingsCards from '../settings/security/security-settings-cards.svelte';
	// TODO: Import ApiKeysCard when api-key directory is ported
	// import ApiKeysCard from '../settings/api-key/api-keys-card.svelte';
	// TODO: Import organization components when fully ported
	// import OrganizationsCard from '../organization/organizations-card.svelte';
	// import UserInvitationsCard from '../organization/user-invitations-card.svelte';
	import { Button } from '../ui/button/index.js';
	import * as Drawer from '../ui/drawer/index.js';
	import { Label } from '../ui/label/index.js';
	import { Menu } from '@lucide/svelte';

	interface Props extends AccountViewProps {}

	let {
		className,
		classNames,
		localization: localizationProp,
		path: pathProp,
		pathname,
		view: viewProp,
		hideNav
	}: Props = $props();

	const {
		apiKey,
		localization: contextLocalization,
		organization,
		account: accountOptions,
		Link
	} = getAuthUIConfig();

	// Authenticate the user (redirect if not authenticated)
	useAuthenticate();

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const path = $derived(pathProp ?? pathname?.split('/').pop());

	const view = $derived(
		viewProp || (accountOptions?.viewPaths ? getViewByPath(accountOptions.viewPaths, path!) : undefined) || 'SETTINGS'
	);

	const navItems = $derived.by(() => {
		const items: {
			view: AccountViewPath;
			label: string;
		}[] = [
			{ view: 'SETTINGS', label: localization.ACCOUNT },
			{ view: 'SECURITY', label: localization.SECURITY }
		];

		if (apiKey) {
			items.push({
				view: 'API_KEYS',
				label: localization.API_KEYS
			});
		}

		if (organization) {
			items.push({
				view: 'ORGANIZATIONS',
				label: localization.ORGANIZATIONS
			});
		}

		return items;
	});

	const currentLabel = $derived(navItems.find((i) => i.view === view)?.label);

	let drawerOpen = $state(false);
</script>

{#if !accountOptions}
	<!-- Return nothing if account options not configured -->
{:else}
	<div class={cn('flex w-full grow flex-col gap-4 md:flex-row md:gap-12', className, classNames?.base)}>
		{#if !hideNav}
			<!-- Mobile Navigation (Drawer) -->
			<div class="flex justify-between gap-2 md:hidden">
				<Label class="text-base font-semibold">
					{currentLabel}
				</Label>

				<Drawer.Root bind:open={drawerOpen}>
					<Drawer.Trigger>
						<Button variant="outline">
							<Menu />
						</Button>
					</Drawer.Trigger>
					<Drawer.Content>
						<Drawer.Header>
							<Drawer.Title class="hidden">
								{localization.SETTINGS}
							</Drawer.Title>
						</Drawer.Header>
						<div class="flex flex-col px-4 pb-4">
							{#each navItems as item (item.view)}
								{@const LinkComponent = Link}
								<LinkComponent
									href={`${accountOptions?.basePath}/${accountOptions?.viewPaths[item.view]}`}
								>
									<Button
										size="lg"
										class={cn(
											'w-full justify-start px-4 transition-none',
											classNames?.drawer?.menuItem,
											view === item.view ? 'font-semibold' : 'text-foreground/70'
										)}
										variant="ghost"
										onclick={() => (drawerOpen = false)}
									>
										{item.label}
									</Button>
								</LinkComponent>
							{/each}
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>

			<!-- Desktop Navigation (Sidebar) -->
			<div class="hidden md:block">
				<div class={cn('flex w-48 flex-col gap-1 lg:w-60', classNames?.sidebar?.base)}>
					{#each navItems as item (item.view)}
						{@const LinkComponent = Link}
						<LinkComponent
							href={`${accountOptions?.basePath}/${accountOptions?.viewPaths[item.view]}`}
						>
							<Button
								size="lg"
								class={cn(
									'w-full justify-start px-4 transition-none',
									classNames?.sidebar?.button,
									view === item.view ? 'font-semibold' : 'text-foreground/70',
									view === item.view && classNames?.sidebar?.buttonActive
								)}
								variant="ghost"
							>
								{item.label}
							</Button>
						</LinkComponent>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Main Content Area -->
		{#if view === 'SETTINGS'}
			<AccountSettingsCards {classNames} localization={localization} />
		{:else if view === 'SECURITY'}
			<!-- TODO: Uncomment when SecuritySettingsCards is ported -->
			<div class="text-muted-foreground">
				Security settings coming soon (SecuritySettingsCards not yet ported)
			</div>
			<!-- <SecuritySettingsCards {classNames} localization={localization} /> -->
		{:else if view === 'API_KEYS'}
			<!-- TODO: Uncomment when ApiKeysCard is ported -->
			<div class="text-muted-foreground">
				API Keys coming soon (ApiKeysCard not yet ported)
			</div>
			<!-- <ApiKeysCard classNames={classNames?.card} localization={localization} /> -->
		{:else if view === 'ORGANIZATIONS' && organization}
			<!-- TODO: Uncomment when organization cards are ported -->
			<div class="text-muted-foreground">
				Organizations coming soon (OrganizationsCard and UserInvitationsCard not yet ported)
			</div>
			<!-- <div class="grid w-full gap-4 md:gap-6">
				<OrganizationsCard classNames={classNames?.card} localization={localization} />
				<UserInvitationsCard classNames={classNames?.card} localization={localization} />
			</div> -->
		{/if}
	</div>
{/if}
