<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { createSvelteTable } from '$lib/components/ui/data-table/data-table.svelte.js';
	import { FlexRender } from '$lib/components/ui/data-table/index.js';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/render-helpers.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import type {
		Column,
		ColumnDef,
		PaginationState,
		Row,
		RowSelectionState,
		SortingState
	} from '@tanstack/table-core';
	import { getCoreRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/table-core';
	import type { Organization } from '$lib/types/admin.js';
	import { createRawSnippet } from 'svelte';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		MoreHorizontal,
		ChevronLeft,
		ChevronRight,
		ChevronsLeft,
		ChevronsRight,
		Users,
		UserCog,
		Edit,
		Trash2
	} from '@lucide/svelte';
	import OrganizationMembersDetail from './organization-members-detail.svelte';
	import DeleteOrganizationDialog from './delete-organization-dialog.svelte';
	import BulkDeleteDialog from './bulk-delete-dialog.svelte';

	let {
		initialPageSize = 10,
		syncWithUrl = false,
		onViewMembers
	}: {
		initialPageSize?: number;
		syncWithUrl?: boolean;
		onViewMembers?: (organizationId: string) => void | Promise<void>;
	} = $props();

	// Get Better Auth client and config
	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const toast = config.toast;

	// Internal state
	let data = $state<Organization[]>([]);
	let isLoading = $state(false);
	let pageCount = $state(0);
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: initialPageSize
	});

	// URL sync - read initial values from URL if enabled
	if (syncWithUrl && typeof window !== 'undefined') {
		const urlPage = Number($page.url.searchParams.get('page') ?? '1');
		const urlLimit = Number($page.url.searchParams.get('limit') ?? String(initialPageSize));
		pagination = {
			pageIndex: urlPage - 1,
			pageSize: urlLimit
		};
	}

	// Update pagination when URL changes (if sync enabled)
	$effect(() => {
		if (syncWithUrl && typeof window !== 'undefined') {
			const urlPage = Number($page.url.searchParams.get('page') ?? '1');
			const urlLimit = Number($page.url.searchParams.get('limit') ?? String(initialPageSize));
			pagination = {
				pageIndex: urlPage - 1,
				pageSize: urlLimit
			};
		}
	});

	// Fetch organizations from Better Auth
	async function fetchOrganizations() {
		isLoading = true;
		try {
			const { data: response, error } = await authClient.organization.list({});

			if (error) {
				toast.error(error.message ?? 'Failed to fetch organizations');
				return;
			}

			if (response) {
				// Better Auth organization.list doesn't support pagination params yet
				// so we'll do client-side pagination for now
				const allOrgs = (response as any[]).map((org) => ({
					id: org.id,
					name: org.name,
					slug: org.slug,
					logo: org.logo,
					createdAt: org.createdAt ? new Date(org.createdAt) : null,
					metadata: org.metadata
				}));

				// Client-side pagination
				const start = pagination.pageIndex * pagination.pageSize;
				const end = start + pagination.pageSize;
				data = allOrgs.slice(start, end);
				pageCount = Math.ceil(allOrgs.length / pagination.pageSize);
			}
		} catch (err) {
			toast.error('Failed to fetch organizations');
		} finally {
			isLoading = false;
		}
	}

	// Fetch on mount and when pagination changes
	$effect(() => {
		fetchOrganizations();
	});

	// Handle pagination change
	function handlePaginationChange(
		updater: PaginationState | ((state: PaginationState) => PaginationState)
	) {
		const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
		pagination = newPagination;

		// Update URL if sync enabled
		if (syncWithUrl && typeof window !== 'undefined') {
			const params = new URLSearchParams($page.url.searchParams);
			params.set('page', String(newPagination.pageIndex + 1));
			params.set('limit', String(newPagination.pageSize));
			goto(`?${params.toString()}`, { replaceState: true, keepFocus: true });
		}
	}

	// Dialog states
	let membersDialogOpen = $state(false);
	let deleteOrganizationDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let selectedOrganization = $state<Organization | null>(null);

	// Table state
	let sorting = $state<SortingState>([]);
	let rowSelection = $state<RowSelectionState>({});

	// Columns definition
	const columns: ColumnDef<Organization>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected(),
					onCheckedChange: (v) => table.toggleAllPageRowsSelected(!!v),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (v) => row.toggleSelected(!!v),
					'aria-label': 'Select row'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[{ name: string }]>((getName) => {
					const { name } = getName();
					return {
						render: () => `<div class="font-medium">${name}</div>`
					};
				});
				return renderSnippet(nameSnippet, { name: row.getValue('name') });
			},
			enableSorting: false
		},
		{
			accessorKey: 'slug',
			header: 'Slug',
			cell: ({ row }) => {
				const slugSnippet = createRawSnippet<[{ slug: string }]>((getSlug) => {
					const { slug } = getSlug();
					return {
						render: () => `<div class="text-muted-foreground font-mono text-sm">${slug}</div>`
					};
				});
				return renderSnippet(slugSnippet, { slug: row.getValue('slug') });
			}
		},
		{
			accessorKey: 'createdAt',
			header: 'Created',
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[{ dateValue: Date | string | null | undefined }]>(
					(getDate) => {
						const { dateValue } = getDate();
						if (!dateValue) {
							return {
								render: () => `<div class="text-sm text-muted-foreground">N/A</div>`
							};
						}
						const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
						if (isNaN(date.getTime())) {
							return {
								render: () => `<div class="text-sm text-muted-foreground">Invalid date</div>`
							};
						}
						const formatted = new Intl.DateTimeFormat('en-US', {
							dateStyle: 'medium'
						}).format(date);
						return {
							render: () => `<div class="text-sm">${formatted}</div>`
						};
					}
				);
				return renderSnippet(dateSnippet, { dateValue: row.getValue('createdAt') });
			}
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => renderSnippet(ActionsCell, { row })
		}
	];

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		pageCount,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get rowSelection() {
				return rowSelection;
			}
		},
		enableRowSelection: true,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: handlePaginationChange,
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});

	// Action handlers
	function handleViewMembers(org: Organization) {
		selectedOrganization = org;
		membersDialogOpen = true;
		if (onViewMembers) {
			onViewMembers(org.id);
		}
	}

	function handleDelete(org: Organization) {
		selectedOrganization = org;
		deleteOrganizationDialogOpen = true;
	}

	async function executeDelete() {
		if (!selectedOrganization) return;

		try {
			const { error } = await authClient.organization.delete({
				organizationId: selectedOrganization.id
			});

			if (error) {
				toast.error(error.message ?? 'Failed to delete organization');
				return;
			}

			toast.success('Organization deleted successfully');
			deleteOrganizationDialogOpen = false;
			selectedOrganization = null;

			await fetchOrganizations();
		} catch (err) {
			toast.error('Failed to delete organization');
		}
	}

	// Bulk actions
	const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);
	const selectedOrgIds = $derived(selectedRows.map((row) => row.original.id));

	function handleBulkDelete() {
		if (selectedOrgIds.length === 0) return;
		bulkDeleteDialogOpen = true;
	}

	async function executeBulkDelete() {
		try {
			for (const orgId of selectedOrgIds) {
				const { error } = await authClient.organization.delete({
					organizationId: orgId
				});

				if (error) {
					toast.error(`Failed to delete organization ${orgId}: ${error.message}`);
					return;
				}
			}

			toast.success(`Successfully deleted ${selectedOrgIds.length} organization(s)`);
			bulkDeleteDialogOpen = false;
			rowSelection = {};

			await fetchOrganizations();
		} catch (err) {
			toast.error('Failed to delete organizations');
		}
	}
</script>

{#snippet ActionsCell({ row }: { row: Row<Organization> })}
	{@const org = row.original}

	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="icon" class="h-8 w-8 p-0">
					<span class="sr-only">Open menu</span>
					<MoreHorizontal class="h-4 w-4" />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Label>Actions</DropdownMenu.Label>

			<DropdownMenu.Item onclick={() => handleViewMembers(org)}>
				<Users class="h-4 w-4" />
				View Members
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			<DropdownMenu.Item onclick={() => navigator.clipboard.writeText(org.id)}>
				Copy Organization ID
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			<DropdownMenu.Item onclick={() => handleDelete(org)} class="text-destructive">
				<Trash2 class="h-4 w-4" />
				Delete Organization
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

<Card.Root class="border-none">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="text-xl">Organizations</Card.Title>
				<Card.Description>Manage organizations and their members</Card.Description>
			</div>
			{#if selectedOrgIds.length > 0}
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">
						{selectedOrgIds.length} selected
					</span>
					<Button variant="destructive" size="sm" onclick={handleBulkDelete}>
						<Trash2 class="h-4 w-4" />
						Delete Selected
					</Button>
				</div>
			{/if}
		</div>
	</Card.Header>
	<Card.Content>
		<div class="rounded-md border">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head class="[&:has([role=checkbox])]:pl-3">
									{#if !header.isPlaceholder}
										<FlexRender
											context={header.getContext()}
											content={header.column.columnDef.header}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#if table.getRowModel().rows?.length}
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="[&:has([role=checkbox])]:pl-3">
										<FlexRender context={cell.getContext()} content={cell.column.columnDef.cell} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center">
								{#if isLoading}
									<span class="text-muted-foreground">Loading...</span>
								{:else}
									<span class="text-muted-foreground">No organizations found.</span>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>

			{#if table.getPageCount() > 1}
				<div class="rounded-b-lg border border-t-0 bg-card p-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-6 lg:space-x-8">
							<div class="flex items-center space-x-1">
								<Button
									variant="outline"
									class="hidden size-7 p-0 lg:flex"
									onclick={() => table.setPageIndex(0)}
									disabled={!table.getCanPreviousPage() || isLoading}
								>
									<span class="sr-only">Go to first page</span>
									<ChevronsLeft class="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									class="size-7 p-0"
									onclick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage() || isLoading}
								>
									<span class="sr-only">Go to previous page</span>
									<ChevronLeft class="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									class="size-7 p-0"
									onclick={() => {
										table.nextPage();
									}}
									disabled={!table.getCanNextPage() || isLoading}
								>
									<span class="sr-only">Go to next page</span>
									<ChevronRight class="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									class="hidden size-7 p-0 lg:flex"
									onclick={() => table.setPageIndex(table.getPageCount() - 1)}
									disabled={!table.getCanNextPage() || isLoading}
								>
									<span class="sr-only">Go to last page</span>
									<ChevronsRight class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="flex items-center justify-end space-x-2 pt-4">
			<div class="flex-1 text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} of
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div class="space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage() || isLoading}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage() || isLoading}
				>
					Next
				</Button>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Organization Members Dialog -->
{#if selectedOrganization}
	<OrganizationMembersDetail
		bind:open={membersDialogOpen}
		organizationId={selectedOrganization.id}
		organizationName={selectedOrganization.name}
		onOpenChange={(open) => {
			membersDialogOpen = open;
			if (!open) {
				selectedOrganization = null;
			}
		}}
	/>
{/if}

<DeleteOrganizationDialog
	bind:open={deleteOrganizationDialogOpen}
	organization={selectedOrganization}
	onDelete={executeDelete}
	onCancel={() => {
		deleteOrganizationDialogOpen = false;
		selectedOrganization = null;
	}}
/>

<BulkDeleteDialog
	bind:open={bulkDeleteDialogOpen}
	itemType="organization"
	itemCount={selectedOrgIds.length}
	items={selectedRows.map((row) => ({ id: row.original.id, name: row.original.name }))}
	onDelete={executeBulkDelete}
	onCancel={() => {
		bulkDeleteDialogOpen = false;
	}}
/>
