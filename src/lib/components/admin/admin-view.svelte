<script lang="ts" module>
	import type { AdminViewProps } from '$lib/types/admin.js';

	export type { AdminViewProps };
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getViewByPath } from '$lib/utils/utils.js';
	import { useAuthenticate } from '$lib/hooks/use-authenticate.svelte.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import AdminDashboard from './admin-dashboard.svelte';
	import UsersAdminTable from './users-admin-table.svelte';
	import OrganizationsAdminTable from './organizations-admin-table.svelte';
	import { adminViewPaths } from '$lib/utils/view-paths.js';

	type Props = AdminViewProps;

	let {
		className,
		classNames,
		localization: localizationProp,
		path: pathProp,
		pathname,
		view: viewProp,
		hideNav
	}: Props = $props();

	const { localization: contextLocalization, Link } = getAuthUIConfig();

	// Authenticate the user (redirect if not authenticated)
	useAuthenticate();

	const localization = $derived({ ...contextLocalization, ...localizationProp });

	const path = $derived(pathProp ?? pathname?.split('/').pop());

	const view = $derived(
		viewProp || getViewByPath(adminViewPaths, path!) || 'DASHBOARD'
	);

	const navItems = $derived([
		{ view: 'DASHBOARD', label: localization.DASHBOARD || 'Dashboard', value: 'dashboard' },
		{ view: 'USERS', label: localization.USERS || 'Users', value: 'users' },
		{ view: 'ORGANIZATIONS', label: localization.ORGANIZATIONS || 'Organizations', value: 'organizations' }
	] as const);

	const currentTabValue = $derived(adminViewPaths[view] || 'dashboard');
</script>

<div class={cn('flex w-full grow flex-col gap-4', className, classNames?.base)}>
	{#if !hideNav}
		<!-- Tabs Navigation -->
		<Tabs.Root value={currentTabValue} class={cn('w-full max-w-md', classNames?.tabs?.root)}>
			<Tabs.List class={cn('grid w-full grid-cols-3', classNames?.tabs?.list)}>
				{#each navItems as item (item.view)}
					{@const LinkComponent = Link}
					<LinkComponent href={`/app/admin/${adminViewPaths[item.view]}`}>
						<Tabs.Trigger value={item.value} class={cn('w-full', classNames?.tabs?.trigger)}>
							{item.label}
						</Tabs.Trigger>
					</LinkComponent>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	{/if}

	<!-- Main Content Area -->
	<div class="flex w-full flex-col gap-4 md:gap-6">
		{#if view === 'DASHBOARD'}
			<AdminDashboard />
		{:else if view === 'USERS'}
			<UsersAdminTable syncWithUrl={true} />
		{:else if view === 'ORGANIZATIONS'}
			<OrganizationsAdminTable syncWithUrl={true} />
		{/if}
	</div>
</div>
