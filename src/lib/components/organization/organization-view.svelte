<script lang="ts" module>
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { OrganizationViewPath } from '$lib/utils/view-paths.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';

	export interface OrganizationViewProps {
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
		view?: OrganizationViewPath;
		hideNav?: boolean;
		slug?: string;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getViewByPath } from '$lib/utils/utils.js';
	import { useAuthenticate } from '$lib/hooks/use-authenticate.svelte.js';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { Button } from '../ui/button/index.js';
	import * as Drawer from '../ui/drawer/index.js';
	import { Label } from '../ui/label/index.js';
	import { Menu } from '@lucide/svelte';
	import OrganizationMembersCard from './organization-members-card.svelte';
	import OrganizationInvitationsCard from './organization-invitations-card.svelte';
	import OrganizationSettingsCards from './organization-settings-cards.svelte';
	// TODO: Import ApiKeysCard when api-key directory is ported
	// import ApiKeysCard from '../settings/api-key/api-keys-card.svelte';
	import { browser } from '$app/environment';

	type Props = OrganizationViewProps;

	let {
		className,
		classNames,
		localization: localizationProp,
		path: pathProp,
		pathname,
		view: viewProp,
		hideNav,
		slug: slugProp
	}: Props = $props();

	const {
		organization: organizationOptions,
		localization: contextLocalization,
		account: accountOptions,
		Link,
		replace,
		apiKey
	} = getAuthUIConfig();

	const { slug: contextSlug, viewPaths } = organizationOptions || {};

	// Authenticate the user (redirect if not authenticated)
	useAuthenticate();

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const path = $derived(pathProp ?? pathname?.split('/').pop());

	const view = $derived(
		viewProp || (viewPaths ? getViewByPath(viewPaths, path!) : undefined) || 'SETTINGS'
	);

	const slug = $derived(slugProp || contextSlug);

	const currentOrg = $derived(useCurrentOrganization({ slug }));
	const organization = $derived(currentOrg?.data);
	const organizationPending = $derived(currentOrg?.isPending ?? false);
	const organizationRefetching = $derived(currentOrg?.isRefetching ?? false);

	const navItems = $derived.by(() => {
		const items: {
			view: OrganizationViewPath;
			label: string;
		}[] = [
			{ view: 'SETTINGS', label: localization.SETTINGS },
			{ view: 'MEMBERS', label: localization.MEMBERS }
		];

		if (apiKey) {
			items.push({
				view: 'API_KEYS',
				label: localization.API_KEYS
			});
		}

		return items;
	});

	const currentLabel = $derived(navItems.find((i) => i.view === view)?.label);

	let drawerOpen = $state(false);

	// Redirect to organizations list if organization doesn't exist
	$effect(() => {
		if (!browser || organization || organizationPending || organizationRefetching) return;

		replace(`${accountOptions?.basePath}/${accountOptions?.viewPaths?.ORGANIZATIONS}`);
	});
</script>

{#if !organizationOptions || !viewPaths}
	<!-- Return nothing if organization options not configured -->
{:else}
	<div
		class={cn('flex w-full grow flex-col gap-4 md:flex-row md:gap-12', className, classNames?.base)}
	>
		{#if !hideNav}
			<!-- Mobile Navigation (Drawer) -->
			<div class="flex justify-between gap-2 md:hidden">
				<Label class="text-base font-semibold">
					{currentLabel}
				</Label>

				<Drawer.Root bind:open={drawerOpen}>
					<Drawer.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">
								<Menu />
							</Button>
						{/snippet}
					</Drawer.Trigger>
					<Drawer.Content>
						<Drawer.Header>
							<Drawer.Title class="hidden">
								{localization.ORGANIZATION}
							</Drawer.Title>
						</Drawer.Header>
						<div class="flex flex-col px-4 pb-4">
							{#each navItems as item (item.view)}
								{@const LinkComponent = Link}
								<LinkComponent
									href={`${organizationOptions?.basePath}${organizationOptions?.pathMode === 'slug' ? `/${slug}` : ''}/${organizationOptions?.viewPaths[item.view]}`}
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
							href={`${organizationOptions?.basePath}${organizationOptions?.pathMode === 'slug' ? `/${slug}` : ''}/${organizationOptions?.viewPaths[item.view]}`}
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
		{#if view === 'MEMBERS'}
			<div class={cn('flex w-full flex-col gap-4 md:gap-6', className, classNames?.cards)}>
				<OrganizationMembersCard classNames={classNames?.card} {localization} {slug} />

				<OrganizationInvitationsCard classNames={classNames?.card} {localization} {slug} />
			</div>
		{:else if view === 'API_KEYS'}
			<!-- TODO: Uncomment when ApiKeysCard is ported -->
			<div class="text-muted-foreground">API Keys coming soon (ApiKeysCard not yet ported)</div>
			<!-- <ApiKeysCard
				classNames={classNames?.card}
				{localization}
				isPending={organizationPending}
				organizationId={organization?.id}
			/> -->
		{:else if view === 'SETTINGS'}
			<OrganizationSettingsCards {classNames} {localization} {slug} />
		{/if}
	</div>
{/if}
