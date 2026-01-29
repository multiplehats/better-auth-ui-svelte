<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import {
		Users,
		Building2,
		ShieldBan,
		UserPlus,
		TrendingUp,
		TrendingDown,
		ArrowRight
	} from '@lucide/svelte';
	import { AreaChart, Area } from 'layerchart';
	import { curveNatural } from 'd3-shape';
	import { scaleUtc } from 'd3-scale';
	import { getAuthClient, getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import UsersAdminTable from './users-admin-table.svelte';
	import OrganizationsAdminTable from './organizations-admin-table.svelte';
	import type { UsersAdminTableProps, OrganizationsAdminTableProps } from '$lib/types/admin.js';

	interface AdminDashboardStats {
		totalUsers: number;
		newUsers30d: number;
		totalOrganizations: number;
		bannedUsers: number;
		newUsersGrowth: number;
		totalUsersGrowth: number;
		orgsGrowth: number;
		bannedPercentage: number;
	}

	interface ChartDataPoint {
		date: Date;
		users: number;
	}

	let {
		showStats = true,
		showChart = true,
		showUsersTable = true,
		showOrgsTable = true,
		isLoading: providedIsLoading,
		beforeStats,
		afterStats,
		customStatsCards,
		beforeChart,
		afterChart,
		customChart,
		beforeUsersTable,
		afterUsersTable,
		beforeOrgsTable,
		afterOrgsTable,
		children,
		usersTableProps,
		orgsTableProps,
		usersTableLimit = 5,
		orgsTableLimit = 5,
		showViewAllActions = true,
		usersViewAllHref: usersViewAllHrefProp,
		orgsViewAllHref: orgsViewAllHrefProp
	}: {
		showStats?: boolean;
		showChart?: boolean;
		showUsersTable?: boolean;
		showOrgsTable?: boolean;
		isLoading?: boolean;
		beforeStats?: Snippet;
		afterStats?: Snippet;
		customStatsCards?: Snippet;
		beforeChart?: Snippet;
		afterChart?: Snippet;
		customChart?: Snippet;
		beforeUsersTable?: Snippet;
		afterUsersTable?: Snippet;
		beforeOrgsTable?: Snippet;
		afterOrgsTable?: Snippet;
		children?: Snippet;
		usersTableProps?: Partial<UsersAdminTableProps>;
		orgsTableProps?: Partial<OrganizationsAdminTableProps>;
		usersTableLimit?: number;
		orgsTableLimit?: number;
		showViewAllActions?: boolean;
		usersViewAllHref?: string;
		orgsViewAllHref?: string;
	} = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const Link = config.Link;

	// Use adminBasePath from config, default to '/admin'
	const adminBasePath = $derived(config.adminBasePath ?? '/admin');
	const usersViewAllHref = $derived(usersViewAllHrefProp ?? `${adminBasePath}/users`);
	const orgsViewAllHref = $derived(orgsViewAllHrefProp ?? `${adminBasePath}/organizations`);

	// State
	let internalIsLoading = $state(true);
	let stats = $state<AdminDashboardStats>({
		totalUsers: 0,
		newUsers30d: 0,
		totalOrganizations: 0,
		bannedUsers: 0,
		newUsersGrowth: 0,
		totalUsersGrowth: 0,
		orgsGrowth: 0,
		bannedPercentage: 0
	});
	let userGrowthData = $state<ChartDataPoint[]>([]);
	let timeRange = $state('90d');

	const isLoading = $derived(providedIsLoading ?? internalIsLoading);

	// Chart time range label
	const selectedLabel = $derived.by(() => {
		switch (timeRange) {
			case '90d':
				return 'Last 3 months';
			case '30d':
				return 'Last 30 days';
			case '7d':
				return 'Last 7 days';
			default:
				return 'Last 3 months';
		}
	});

	// Filtered chart data
	const filteredChartData = $derived(
		userGrowthData.filter((item) => {
			const referenceDate = new Date();
			let daysToSubtract = 90;
			if (timeRange === '30d') {
				daysToSubtract = 30;
			} else if (timeRange === '7d') {
				daysToSubtract = 7;
			}

			const cutoffDate = new Date(referenceDate.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
			return item.date >= cutoffDate;
		})
	);

	// Check if there's any actual user growth data (not all zeros)
	const hasUserGrowthData = $derived(
		filteredChartData.length > 0 && filteredChartData.some((item) => item.users > 0)
	);

	// Chart config
	const chartConfig = {
		users: {
			label: 'Users',
			color: 'var(--chart-1)'
		}
	} satisfies Chart.ChartConfig;

	// Fetch all data
	async function fetchDashboardData() {
		internalIsLoading = true;
		try {
			// Fetch all users
			const usersResponse = await authClient.admin.listUsers({
				query: {
					limit: 1000,
					offset: 0
				}
			});

			if (usersResponse.data) {
				const users = usersResponse.data.users as any[];
				const total = usersResponse.data.total ?? users.length;

				// Calculate date ranges
				const now = new Date();
				const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
				const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

				// Count new users in different periods
				const newUsers30d = users.filter((u: any) => {
					if (!u.createdAt) return false;
					const created = new Date(u.createdAt);
					return created >= thirtyDaysAgo;
				}).length;

				const newUsersPrevious30d = users.filter((u: any) => {
					if (!u.createdAt) return false;
					const created = new Date(u.createdAt);
					return created >= sixtyDaysAgo && created < thirtyDaysAgo;
				}).length;

				// Count banned users
				const bannedCount = users.filter((u: any) => u.banned).length;

				// Calculate growth percentages
				const newUsersGrowth =
					newUsersPrevious30d > 0
						? ((newUsers30d - newUsersPrevious30d) / newUsersPrevious30d) * 100
						: newUsers30d > 0
							? 100
							: 0;

				const bannedPercentage = total > 0 ? (bannedCount / total) * 100 : 0;

				// Build daily user growth data for last 90 days
				const dailyCounts = new SvelteMap<string, number>();

				// Initialize all days with 0
				for (let i = 0; i < 90; i++) {
					const date = new Date(ninetyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
					const dateStr = date.toISOString().split('T')[0];
					dailyCounts.set(dateStr, 0);
				}

				// Count users by creation date
				users.forEach((user: any) => {
					if (user.createdAt) {
						const createdDate = new Date(user.createdAt);
						if (createdDate >= ninetyDaysAgo) {
							const dateStr = createdDate.toISOString().split('T')[0];
							dailyCounts.set(dateStr, (dailyCounts.get(dateStr) ?? 0) + 1);
						}
					}
				});

				userGrowthData = Array.from(dailyCounts.entries())
					.map(([dateStr, users]) => ({ date: new Date(dateStr), users }))
					.sort((a, b) => a.date.getTime() - b.date.getTime());

				stats = {
					totalUsers: total,
					newUsers30d,
					totalOrganizations: 0, // will be updated below
					bannedUsers: bannedCount,
					newUsersGrowth,
					totalUsersGrowth: 0, // Could calculate if we had historical data
					orgsGrowth: 0, // Could calculate if we had historical data
					bannedPercentage
				};
			}

			// Fetch organizations
			const orgsResponse = await authClient.organization.list();
			if (orgsResponse.data) {
				stats.totalOrganizations = orgsResponse.data.length;
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			internalIsLoading = false;
		}
	}

	// Fetch data on mount
	$effect(() => {
		fetchDashboardData();
	});

	// Helper to format numbers
	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Helper to format percentage
	function formatPercentage(num: number): string {
		const sign = num >= 0 ? '+' : '';
		return `${sign}${num.toFixed(1)}%`;
	}
</script>

<div class="@container/main flex flex-1 flex-col gap-2">
	<div class="flex flex-col gap-4">
		<!-- Before Stats Extension Point -->
		{#if beforeStats}
			{@render beforeStats()}
		{/if}

		<!-- Stat Cards Section -->
		{#if showStats}
			{#if customStatsCards}
				{@render customStatsCards()}
			{:else}
				<div
					class="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card"
				>
					<!-- Total Users Card -->
					<Card.Root class="@container/card" data-slot="card">
						<Card.Header>
							<Card.Description>Total Users</Card.Description>
							<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{#if isLoading}
									<Skeleton class="h-9 w-24" />
								{:else}
									{formatNumber(stats.totalUsers)}
								{/if}
							</Card.Title>
							{#if !isLoading}
								<Card.Action>
									<Badge variant="outline">
										<Users class="size-3" />
									</Badge>
								</Card.Action>
							{:else}
								<Card.Action>
									<Skeleton class="h-6 w-12" />
								</Card.Action>
							{/if}
						</Card.Header>
						<Card.Footer class="flex-col items-start gap-1.5 text-sm">
							<div class="text-muted-foreground">Total registered accounts</div>
						</Card.Footer>
					</Card.Root>

					<!-- New Users (30d) Card -->
					<Card.Root class="@container/card" data-slot="card">
						<Card.Header>
							<Card.Description>New Users</Card.Description>
							<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{#if isLoading}
									<Skeleton class="h-9 w-20" />
								{:else}
									{formatNumber(stats.newUsers30d)}
								{/if}
							</Card.Title>
							{#if !isLoading}
								<Card.Action>
									<Badge variant="outline">
										{#if stats.newUsersGrowth >= 0}
											<TrendingUp class="size-3" />
											{formatPercentage(stats.newUsersGrowth)}
										{:else}
											<TrendingDown class="size-3" />
											{formatPercentage(stats.newUsersGrowth)}
										{/if}
									</Badge>
								</Card.Action>
							{:else}
								<Card.Action>
									<Skeleton class="h-6 w-16" />
								</Card.Action>
							{/if}
						</Card.Header>
						<Card.Footer class="flex-col items-start gap-1.5 text-sm">
							<div class="line-clamp-1 flex gap-2 font-medium">
								{#if isLoading}
									<Skeleton class="h-4 w-32" />
								{:else if stats.newUsersGrowth >= 0}
									Trending up this month <TrendingUp class="size-4" />
								{:else}
									Down from previous period <TrendingDown class="size-4" />
								{/if}
							</div>
							<div class="text-muted-foreground">Last 30 days</div>
						</Card.Footer>
					</Card.Root>

					<!-- Organizations Card -->
					<Card.Root class="@container/card" data-slot="card">
						<Card.Header>
							<Card.Description>Organizations</Card.Description>
							<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{#if isLoading}
									<Skeleton class="h-9 w-16" />
								{:else}
									{formatNumber(stats.totalOrganizations)}
								{/if}
							</Card.Title>
							{#if !isLoading}
								<Card.Action>
									<Badge variant="outline">
										<Building2 class="size-3" />
									</Badge>
								</Card.Action>
							{:else}
								<Card.Action>
									<Skeleton class="h-6 w-12" />
								</Card.Action>
							{/if}
						</Card.Header>
						<Card.Footer class="flex-col items-start gap-1.5 text-sm">
							<div class="text-muted-foreground">Active organizations</div>
						</Card.Footer>
					</Card.Root>

					<!-- Banned Users Card -->
					<Card.Root class="@container/card" data-slot="card">
						<Card.Header>
							<Card.Description>Banned Users</Card.Description>
							<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								{#if isLoading}
									<Skeleton class="h-9 w-12" />
								{:else}
									{formatNumber(stats.bannedUsers)}
								{/if}
							</Card.Title>
							{#if !isLoading}
								<Card.Action>
									<Badge
										variant="outline"
										class={stats.bannedPercentage > 5 ? 'text-destructive' : ''}
									>
										<ShieldBan class="size-3" />
										{formatPercentage(stats.bannedPercentage)}
									</Badge>
								</Card.Action>
							{:else}
								<Card.Action>
									<Skeleton class="h-6 w-16" />
								</Card.Action>
							{/if}
						</Card.Header>
						<Card.Footer class="flex-col items-start gap-1.5 text-sm">
							<div class="text-muted-foreground">
								{#if isLoading}
									<Skeleton class="h-4 w-28" />
								{:else}
									{stats.bannedPercentage > 5 ? 'Attention needed' : 'Currently restricted'}
								{/if}
							</div>
						</Card.Footer>
					</Card.Root>
				</div>
			{/if}
		{/if}

		<!-- After Stats Extension Point -->
		{#if afterStats}
			{@render afterStats()}
		{/if}

		<!-- Before Chart Extension Point -->
		{#if beforeChart}
			{@render beforeChart()}
		{/if}

		<!-- Interactive User Growth Chart -->
		{#if showChart}
			{#if customChart}
				{@render customChart()}
			{:else}

					<Card.Root class="@container/card">
						<Card.Header>
							<Card.Title>User Growth</Card.Title>
							<Card.Description>
								<span class="hidden @[540px]/card:block"> New user registrations over time </span>
								<span class="@[540px]/card:hidden">New registrations</span>
							</Card.Description>
							<Card.Action>
								<ToggleGroup.Root
									type="single"
									bind:value={timeRange}
									variant="outline"
									class="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
								>
									<ToggleGroup.Item value="90d">Last 3 months</ToggleGroup.Item>
									<ToggleGroup.Item value="30d">Last 30 days</ToggleGroup.Item>
									<ToggleGroup.Item value="7d">Last 7 days</ToggleGroup.Item>
								</ToggleGroup.Root>
								<Select.Root type="single" bind:value={timeRange}>
									<Select.Trigger
										size="sm"
										class="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
										aria-label="Select a value"
									>
										<span data-slot="select-value">
											{selectedLabel}
										</span>
									</Select.Trigger>
									<Select.Content class="rounded-xl">
										<Select.Item value="90d" class="rounded-lg">Last 3 months</Select.Item>
										<Select.Item value="30d" class="rounded-lg">Last 30 days</Select.Item>
										<Select.Item value="7d" class="rounded-lg">Last 7 days</Select.Item>
									</Select.Content>
								</Select.Root>
							</Card.Action>
						</Card.Header>
						<Card.Content class="px-2 pt-4 sm:px-6 sm:pt-6">
							{#if isLoading}
								<Skeleton class="h-[250px] w-full" />
							{:else if hasUserGrowthData}
								<Chart.Container config={chartConfig} class="aspect-auto h-[250px] w-full">
									<AreaChart
										data={filteredChartData}
										x="date"
										xScale={scaleUtc()}
										series={[
											{
												key: 'users',
												label: 'New Users',
												color: chartConfig.users.color
											}
										]}
										axis="x"
										props={{
											area: {
												curve: curveNatural,
												'fill-opacity': 0.4,
												line: { class: 'stroke-1' },
												motion: 'tween'
											},
											xAxis: {
												ticks: timeRange === '7d' ? 7 : undefined,
												format: (v) => {
													return v.toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric'
													});
												}
											},
											yAxis: { format: () => '' }
										}}
									>
										{#snippet marks({ series, getAreaProps })}
											<defs>
												<linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stop-color="var(--color-users)" stop-opacity={1.0} />
													<stop offset="95%" stop-color="var(--color-users)" stop-opacity={0.1} />
												</linearGradient>
											</defs>
											{#each series as s, i (s.key)}
												<Area {...getAreaProps(s, i)} fill="url(#fillUsers)" />
											{/each}
										{/snippet}
										{#snippet tooltip()}
											<Chart.Tooltip
												labelFormatter={(v: Date) => {
													return v.toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric'
													});
												}}
												indicator="line"
											/>
										{/snippet}
									</AreaChart>
								</Chart.Container>
							{:else}
								<div class="flex h-[250px] items-center justify-center">
									<p class="text-muted-foreground">No data available</p>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>

			{/if}
		{/if}

		<!-- After Chart Extension Point -->
		{#if afterChart}
			{@render afterChart()}
		{/if}

		<!-- Tables with Tabs -->
		{#if showUsersTable || showOrgsTable}

				<Tabs.Root value="users">
					<Tabs.List class="grid w-full max-w-md grid-cols-2">
						{#if showUsersTable}
							<Tabs.Trigger value="users">Users</Tabs.Trigger>
						{/if}
						{#if showOrgsTable}
							<Tabs.Trigger value="organizations">Organizations</Tabs.Trigger>
						{/if}
					</Tabs.List>

					{#if showUsersTable}
						<Tabs.Content value="users" class="mt-6">
							<!-- Before Users Table Extension Point -->
							{#if beforeUsersTable}
								{@render beforeUsersTable()}
							{/if}

							<UsersAdminTable initialPageSize={usersTableLimit} {...usersTableProps} />

							<!-- View All Button -->
							{#if showViewAllActions}
								{@const LinkComponent = Link}
								<div class="mt-4 flex justify-center">
									<LinkComponent href={usersViewAllHref}>
										<Button variant="outline">
											View All Users
											<ArrowRight class="ml-2 size-4" />
										</Button>
									</LinkComponent>
								</div>
							{/if}

							<!-- After Users Table Extension Point -->
							{#if afterUsersTable}
								{@render afterUsersTable()}
							{/if}
						</Tabs.Content>
					{/if}

					{#if showOrgsTable}
						<Tabs.Content value="organizations" class="mt-6">
							<!-- Before Orgs Table Extension Point -->
							{#if beforeOrgsTable}
								{@render beforeOrgsTable()}
							{/if}

							<OrganizationsAdminTable initialPageSize={orgsTableLimit} {...orgsTableProps} />

							<!-- View All Button -->
							{#if showViewAllActions}
								{@const LinkComponent = Link}
								<div class="mt-4 flex justify-center">
									<LinkComponent href={orgsViewAllHref}>
										<Button variant="outline">
											View All Organizations
											<ArrowRight class="ml-2 size-4" />
										</Button>
									</LinkComponent>
								</div>
							{/if}

							<!-- After Orgs Table Extension Point -->
							{#if afterOrgsTable}
								{@render afterOrgsTable()}
							{/if}
						</Tabs.Content>
					{/if}
				</Tabs.Root>

		{/if}

		<!-- Children Extension Point -->
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
