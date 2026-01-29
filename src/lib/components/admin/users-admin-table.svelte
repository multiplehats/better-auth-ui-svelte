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
	import type { UserWithRole } from '$lib/types/admin.js';
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
		UserCog,
		Ban,
		ShieldCheck,
		KeyRound,
		Trash2,
		LogOut,
		UserPlus
	} from '@lucide/svelte';
	import BanUserDialog from './ban-user-dialog.svelte';
	import UpdateRoleDialog from './update-role-dialog.svelte';
	import ImpersonateUserDialog from './impersonate-user-dialog.svelte';
	import ResetPasswordDialog from './reset-password-dialog.svelte';
	import RevokeSessionsDialog from './revoke-sessions-dialog.svelte';
	import DeleteUserDialog from './delete-user-dialog.svelte';
	import BulkDeleteDialog from './bulk-delete-dialog.svelte';
	import CreateUserDialog from './create-user-dialog.svelte';

	let {
		initialPageSize = 10,
		syncWithUrl = false
	}: {
		initialPageSize?: number;
		syncWithUrl?: boolean;
	} = $props();

	// Get Better Auth client and config
	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const toast = config.toast;

	// Internal state
	let data = $state<UserWithRole[]>([]);
	let isLoading = $state(false);
	let pageCount = $state(0);
	// svelte-ignore state_referenced_locally -- initialPageSize sets the initial pagination state
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: initialPageSize
	});

	// URL sync - read initial values from URL if enabled
	// svelte-ignore state_referenced_locally -- syncWithUrl and initialPageSize are checked once at mount
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
			const defaultPageSize = initialPageSize;
			const urlPage = Number($page.url.searchParams.get('page') ?? '1');
			const urlLimit = Number($page.url.searchParams.get('limit') ?? String(defaultPageSize));
			pagination = {
				pageIndex: urlPage - 1,
				pageSize: urlLimit
			};
		}
	});

	// Fetch users from Better Auth
	async function fetchUsers() {
		isLoading = true;
		try {
			const { data: response, error } = await authClient.admin.listUsers({
				limit: pagination.pageSize,
				offset: pagination.pageIndex * pagination.pageSize
			});

			if (error) {
				toast.error(error.message ?? 'Failed to fetch users');
				return;
			}

			if (response) {
				data = (response.users as any[]).map((user) => ({
					id: user.id,
					email: user.email,
					name: user.name,
					emailVerified: user.emailVerified,
					image: user.image,
					createdAt: user.createdAt ? new Date(user.createdAt) : null,
					updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
					role: user.role ?? 'user',
					banned: user.banned ?? false,
					banReason: user.banReason,
					banExpires: user.banExpires ? new Date(user.banExpires) : null
				}));

				const total = response.total ?? data.length;
				pageCount = Math.ceil(total / pagination.pageSize);
			}
		} catch (err) {
			toast.error('Failed to fetch users');
		} finally {
			isLoading = false;
		}
	}

	// Fetch on mount and when pagination changes
	$effect(() => {
		fetchUsers();
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
	let impersonateDialogOpen = $state(false);
	let banDialogOpen = $state(false);
	let roleDialogOpen = $state(false);
	let resetPasswordDialogOpen = $state(false);
	let revokeSessionsDialogOpen = $state(false);
	let deleteUserDialogOpen = $state(false);
	let bulkDeleteDialogOpen = $state(false);
	let createUserDialogOpen = $state(false);
	let selectedUser = $state<UserWithRole | null>(null);

	// Available roles for the update role dialog
	const availableRoles = ['user', 'admin', 'moderator'];

	// Table state
	let sorting = $state<SortingState>([]);
	let rowSelection = $state<RowSelectionState>({});

	// Columns definition
	const columns: ColumnDef<UserWithRole>[] = [
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
			accessorKey: 'email',
			header: 'Email',
			cell: ({ row }) => {
				const emailSnippet = createRawSnippet<[{ email: string }]>((getEmail) => {
					const { email } = getEmail();
					return {
						render: () => `<div class="font-medium">${email}</div>`
					};
				});
				return renderSnippet(emailSnippet, { email: row.getValue('email') });
			},
			enableSorting: false
		},
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => {
				const nameSnippet = createRawSnippet<[{ name: string | null | undefined }]>((getName) => {
					const { name } = getName();
					return {
						render: () =>
							`<div class="text-muted-foreground">${name ?? '<span class="italic">No name</span>'}</div>`
					};
				});
				return renderSnippet(nameSnippet, { name: row.getValue('name') });
			}
		},
		{
			accessorKey: 'role',
			header: 'Role',
			cell: ({ row }) => {
				const roleSnippet = createRawSnippet<[{ role: string }]>((getRole) => {
					const { role } = getRole();
					const baseClass = 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3';
					let variantClass = '';
					if (role === 'admin') {
						variantClass = 'border-transparent bg-purple-500 text-white [a&]:hover:bg-purple-600';
					} else if (role === 'moderator') {
						variantClass = 'border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600';
					} else {
						variantClass = 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent';
					}
					return {
						render: () => `<span class="${baseClass} ${variantClass}">${role}</span>`
					};
				});
				return renderSnippet(roleSnippet, { role: row.getValue('role') });
			}
		},
		{
			accessorKey: 'banned',
			header: 'Status',
			cell: ({ row }) => {
				const bannedSnippet = createRawSnippet<[{ banned: boolean }]>((getBanned) => {
					const { banned } = getBanned();
					const baseClass = 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3';
					const variantClass = banned
						? 'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white'
						: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground border-green-600 text-green-600';
					const text = banned ? 'Banned' : 'Active';
					return {
						render: () => `<span class="${baseClass} ${variantClass}">${text}</span>`
					};
				});
				return renderSnippet(bannedSnippet, { banned: row.getValue('banned') });
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
		get pageCount() {
			return pageCount;
		},
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
	function handleImpersonate(user: UserWithRole) {
		selectedUser = user;
		impersonateDialogOpen = true;
	}

	async function executeImpersonate() {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.impersonateUser({
				userId: selectedUser.id
			});

			if (error) {
				toast.error(error.message ?? 'Failed to impersonate user');
				return;
			}

			toast.success('Successfully impersonating user');
			impersonateDialogOpen = false;
			selectedUser = null;

			// Reload the page to reflect the impersonated session
			if (typeof window !== 'undefined') {
				window.location.reload();
			}
		} catch (err) {
			toast.error('Failed to impersonate user');
		}
	}

	function handleBan(user: UserWithRole) {
		selectedUser = user;
		banDialogOpen = true;
	}

	async function executeBan(reason?: string, expiresAt?: Date) {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.banUser({
				userId: selectedUser.id,
				banReason: reason,
				banExpiresIn: expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : undefined
			});

			if (error) {
				toast.error(error.message ?? 'Failed to ban user');
				return;
			}

			toast.success('User banned successfully');
			banDialogOpen = false;
			selectedUser = null;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to ban user');
		}
	}

	function handleUpdateRole(user: UserWithRole) {
		selectedUser = user;
		roleDialogOpen = true;
	}

	async function executeUpdateRole(role: string) {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.setRole({
				userId: selectedUser.id,
				role
			});

			if (error) {
				toast.error(error.message ?? 'Failed to update role');
				return;
			}

			toast.success('Role updated successfully');
			roleDialogOpen = false;
			selectedUser = null;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to update role');
		}
	}

	async function handleUnban(user: UserWithRole) {
		try {
			const { error } = await authClient.admin.unbanUser({
				userId: user.id
			});

			if (error) {
				toast.error(error.message ?? 'Failed to unban user');
				return;
			}

			toast.success('User unbanned successfully');

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to unban user');
		}
	}

	function handleDelete(user: UserWithRole) {
		selectedUser = user;
		deleteUserDialogOpen = true;
	}

	async function executeDelete() {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.removeUser({
				userId: selectedUser.id
			});

			if (error) {
				toast.error(error.message ?? 'Failed to delete user');
				return;
			}

			toast.success('User deleted successfully');
			deleteUserDialogOpen = false;
			selectedUser = null;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to delete user');
		}
	}

	function handleResetPassword(user: UserWithRole) {
		selectedUser = user;
		resetPasswordDialogOpen = true;
	}

	async function executeResetPassword(newPassword: string) {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.setUserPassword({
				userId: selectedUser.id,
				newPassword
			});

			if (error) {
				toast.error(error.message ?? 'Failed to reset password');
				return;
			}

			toast.success('Password reset successfully');
			resetPasswordDialogOpen = false;
			selectedUser = null;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to reset password');
		}
	}

	function handleRevokeSessions(user: UserWithRole) {
		selectedUser = user;
		revokeSessionsDialogOpen = true;
	}

	async function executeRevokeSessions() {
		if (!selectedUser) return;

		try {
			const { error } = await authClient.admin.revokeUserSessions({
				userId: selectedUser.id
			});

			if (error) {
				toast.error(error.message ?? 'Failed to revoke sessions');
				return;
			}

			toast.success('Sessions revoked successfully');
			revokeSessionsDialogOpen = false;
			selectedUser = null;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to revoke sessions');
		}
	}

	// Bulk actions
	const selectedRows = $derived(table.getFilteredSelectedRowModel().rows);
	const selectedUserIds = $derived(selectedRows.map((row) => row.original.id));

	function handleBulkDelete() {
		if (selectedUserIds.length === 0) return;
		bulkDeleteDialogOpen = true;
	}

	async function executeBulkDelete() {
		try {
			for (const userId of selectedUserIds) {
				const { error } = await authClient.admin.removeUser({
					userId
				});

				if (error) {
					toast.error(`Failed to delete user ${userId}: ${error.message}`);
					return;
				}
			}

			toast.success(`Successfully deleted ${selectedUserIds.length} user(s)`);
			bulkDeleteDialogOpen = false;
			rowSelection = {};

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to delete users');
		}
	}

	function handleCreateUser() {
		createUserDialogOpen = true;
	}

	async function executeCreateUser(
		email: string,
		password: string,
		name: string,
		role?: string,
		customData?: Record<string, any>
	) {
		try {
			const { error } = await authClient.admin.createUser({
				email,
				password,
				name,
				role,
				data: customData
			});

			if (error) {
				toast.error(error.message ?? 'Failed to create user');
				return;
			}

			toast.success('User created successfully');
			createUserDialogOpen = false;

			await fetchUsers();
		} catch (err) {
			toast.error('Failed to create user');
		}
	}
</script>

{#snippet ActionsCell({ row }: { row: Row<UserWithRole> })}
	{@const user = row.original}

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

			<DropdownMenu.Item onclick={() => handleImpersonate(user)}>
				<UserCog class="h-4 w-4" />
				Impersonate User
			</DropdownMenu.Item>

			<DropdownMenu.Item onclick={() => handleUpdateRole(user)}>
				<ShieldCheck class="h-4 w-4" />
				Update Role
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			{#if user.banned}
				<DropdownMenu.Item onclick={() => handleUnban(user)}>
					<ShieldCheck class="h-4 w-4" />
					Unban User
				</DropdownMenu.Item>
			{:else}
				<DropdownMenu.Item onclick={() => handleBan(user)}>
					<Ban class="h-4 w-4" />
					Ban User
				</DropdownMenu.Item>
			{/if}

			<DropdownMenu.Item onclick={() => handleResetPassword(user)}>
				<KeyRound class="h-4 w-4" />
				Reset Password
			</DropdownMenu.Item>

			<DropdownMenu.Item onclick={() => handleRevokeSessions(user)}>
				<LogOut class="h-4 w-4" />
				Revoke Sessions
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			<DropdownMenu.Item onclick={() => handleDelete(user)} class="text-destructive">
				<Trash2 class="h-4 w-4" />
				Delete User
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

<Card.Root class="border-none">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="text-xl">Users</Card.Title>
				<Card.Description>Manage user accounts and permissions</Card.Description>
			</div>
			<div class="flex items-center gap-2">
				{#if selectedUserIds.length > 0}
					<span class="text-sm text-muted-foreground">
						{selectedUserIds.length} selected
					</span>
					<Button variant="destructive" size="sm" onclick={handleBulkDelete}>
						<Trash2 class="h-4 w-4" />
						Delete Selected
					</Button>
				{:else}
					<Button size="sm" onclick={handleCreateUser}>
						<UserPlus class="h-4 w-4" />
						Create User
					</Button>
				{/if}
			</div>
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
									<span class="text-muted-foreground">No users found.</span>
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

<!-- Dialogs -->
<ImpersonateUserDialog
	bind:open={impersonateDialogOpen}
	user={selectedUser}
	onImpersonate={executeImpersonate}
	onCancel={() => {
		impersonateDialogOpen = false;
		selectedUser = null;
	}}
/>

<BanUserDialog
	bind:open={banDialogOpen}
	user={selectedUser}
	onBan={executeBan}
	onCancel={() => {
		banDialogOpen = false;
		selectedUser = null;
	}}
/>

<UpdateRoleDialog
	bind:open={roleDialogOpen}
	user={selectedUser}
	currentRole={selectedUser?.role ?? 'user'}
	roles={availableRoles}
	onUpdate={executeUpdateRole}
	onCancel={() => {
		roleDialogOpen = false;
		selectedUser = null;
	}}
/>

<ResetPasswordDialog
	bind:open={resetPasswordDialogOpen}
	user={selectedUser}
	onResetPassword={executeResetPassword}
	onCancel={() => {
		resetPasswordDialogOpen = false;
		selectedUser = null;
	}}
/>

<RevokeSessionsDialog
	bind:open={revokeSessionsDialogOpen}
	user={selectedUser}
	onRevoke={executeRevokeSessions}
	onCancel={() => {
		revokeSessionsDialogOpen = false;
		selectedUser = null;
	}}
/>

<DeleteUserDialog
	bind:open={deleteUserDialogOpen}
	user={selectedUser}
	onDelete={executeDelete}
	onCancel={() => {
		deleteUserDialogOpen = false;
		selectedUser = null;
	}}
/>

<BulkDeleteDialog
	bind:open={bulkDeleteDialogOpen}
	itemType="user"
	itemCount={selectedUserIds.length}
	items={selectedRows.map((row) => ({ id: row.original.id, name: row.original.email }))}
	onDelete={executeBulkDelete}
	onCancel={() => {
		bulkDeleteDialogOpen = false;
	}}
/>

<CreateUserDialog
	bind:open={createUserDialogOpen}
	roles={availableRoles}
	onCreate={executeCreateUser}
	onCancel={() => {
		createUserDialogOpen = false;
	}}
/>
