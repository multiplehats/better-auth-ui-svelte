<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Badge from '$lib/components/ui/badge/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { OrganizationMember, OrganizationInvitation } from '$lib/types/admin.js';
	import {
		Users,
		Search,
		MoreHorizontal,
		UserCog,
		ShieldCheck,
		UserMinus,
		Mail,
		Clock
	} from '@lucide/svelte';
	import RemoveMemberDialog from './remove-member-dialog.svelte';

	let {
		organizationId,
		organizationName,
		open = $bindable(false),
		onOpenChange,
		onImpersonate,
		onUpdateMemberRole,
		onRemoveMember
	}: {
		organizationId: string;
		organizationName: string;
		open: boolean;
		onOpenChange?: (open: boolean) => void;
		onImpersonate?: (userId: string) => void | Promise<void>;
		onUpdateMemberRole?: (userId: string, role: string) => void | Promise<void>;
		onRemoveMember?: (userId: string) => void | Promise<void>;
	} = $props();

	// Mock data for demonstration - in real app, fetch from API
	let isLoadingMembers = $state(true);
	let isLoadingInvitations = $state(true);
	let members = $state<OrganizationMember[]>([]);
	let invitations = $state<OrganizationInvitation[]>([]);
	let searchQuery = $state('');
	let removeMemberDialogOpen = $state(false);
	let selectedMemberEmail = $state<string | null>(null);
	let selectedMemberName = $state<string | null>(null);
	let selectedMemberUserId = $state<string | null>(null);

	// Simulate data fetching
	$effect(() => {
		if (open) {
			// Reset state
			isLoadingMembers = true;
			isLoadingInvitations = true;
			members = [];
			invitations = [];

			// Simulate API call
			setTimeout(() => {
				isLoadingMembers = false;
				isLoadingInvitations = false;
			}, 500);
		}
	});

	const filteredMembers = $derived(
		members.filter(
			(member) =>
				member.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				member.role.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	async function handleImpersonate(userId: string) {
		if (onImpersonate) {
			await onImpersonate(userId);
		}
	}

	async function handleUpdateRole(userId: string, newRole: string) {
		if (onUpdateMemberRole) {
			await onUpdateMemberRole(userId, newRole);
		}
	}

	function handleRemoveMember(userId: string, email: string, name?: string | null) {
		selectedMemberUserId = userId;
		selectedMemberEmail = email;
		selectedMemberName = name || null;
		removeMemberDialogOpen = true;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		if (onOpenChange) {
			onOpenChange(newOpen);
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="flex max-h-[85vh] flex-col sm:max-w-[700px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Users class="h-5 w-5" />
				{organizationName} - Members
			</Dialog.Title>
			<Dialog.Description>
				View and manage members of this organization. You can impersonate users, update roles, or
				remove members.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-1 flex-col gap-4 overflow-hidden py-4">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
				<Input placeholder="Search members..." bind:value={searchQuery} class="pl-8" />
			</div>

			<!-- Members Table -->
			<div class="flex-1 overflow-auto rounded-md border">
				{#if isLoadingMembers}
					<div class="space-y-3 p-4">
						<Skeleton class="h-12 w-full" />
						<Skeleton class="h-12 w-full" />
						<Skeleton class="h-12 w-full" />
					</div>
				{:else if filteredMembers.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Users class="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 class="text-lg font-semibold">No members found</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							{searchQuery
								? 'Try adjusting your search query'
								: 'This organization has no members yet'}
						</p>
					</div>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Member</Table.Head>
								<Table.Head>Role</Table.Head>
								<Table.Head>Joined</Table.Head>
								<Table.Head class="w-[50px]"></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredMembers as member (member.id)}
								<Table.Row>
									<Table.Cell>
										<div class="flex flex-col">
											<span class="font-medium">{member.user.email}</span>
											{#if member.user.name}
												<span class="text-sm text-muted-foreground">{member.user.name}</span>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge.Root
											variant={member.role === 'owner'
												? 'default'
												: member.role === 'admin'
													? 'secondary'
													: 'outline'}
										>
											<span class="capitalize">{member.role}</span>
										</Badge.Root>
									</Table.Cell>
									<Table.Cell>
										<span class="text-sm text-muted-foreground">
											{(() => {
												if (!member.createdAt) return 'N/A';
												const date =
													member.createdAt instanceof Date
														? member.createdAt
														: new Date(member.createdAt);
												if (isNaN(date.getTime())) return 'Invalid date';
												return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
													date
												);
											})()}
										</span>
									</Table.Cell>
									<Table.Cell>
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

												{#if onImpersonate}
													<DropdownMenu.Item onclick={() => handleImpersonate(member.user.id)}>
														<UserCog class="h-4 w-4" />
														Impersonate
													</DropdownMenu.Item>
												{/if}

												{#if onUpdateMemberRole && member.role !== 'owner'}
													<DropdownMenu.Sub>
														<DropdownMenu.SubTrigger>
															<ShieldCheck class="h-4 w-4" />
															Change Role
														</DropdownMenu.SubTrigger>
														<DropdownMenu.SubContent>
															<DropdownMenu.Item
																onclick={() => handleUpdateRole(member.user.id, 'member')}
															>
																Member
															</DropdownMenu.Item>
															<DropdownMenu.Item
																onclick={() => handleUpdateRole(member.user.id, 'admin')}
															>
																Admin
															</DropdownMenu.Item>
														</DropdownMenu.SubContent>
													</DropdownMenu.Sub>
												{/if}

												{#if onRemoveMember && member.role !== 'owner'}
													<DropdownMenu.Separator />
													<DropdownMenu.Item
														onclick={() =>
															handleRemoveMember(
																member.user.id,
																member.user.email,
																member.user.name
															)}
														class="text-destructive"
													>
														<UserMinus class="h-4 w-4" />
														Remove Member
													</DropdownMenu.Item>
												{/if}
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</div>

			<!-- Pending Invitations -->
			{#if !isLoadingInvitations && invitations.length > 0}
				<div class="rounded-md border p-4">
					<h4 class="mb-3 flex items-center gap-2 text-sm font-semibold">
						<Mail class="h-4 w-4" />
						Pending Invitations ({invitations.length})
					</h4>
					<div class="space-y-2">
						{#each invitations as invitation (invitation.id)}
							<div class="flex items-center justify-between rounded-md bg-muted/50 p-2 text-sm">
								<div class="flex items-center gap-3">
									<Clock class="h-4 w-4 text-muted-foreground" />
									<div>
										<div class="font-medium">{invitation.email}</div>
										<div class="text-xs text-muted-foreground">
											Role: {invitation.role} • Expires:{' '}
											{(() => {
												if (!invitation.expiresAt) return 'N/A';
												const date =
													invitation.expiresAt instanceof Date
														? invitation.expiresAt
														: new Date(invitation.expiresAt);
												if (isNaN(date.getTime())) return 'Invalid date';
												return new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(
													date
												);
											})()}
										</div>
									</div>
								</div>
								<Badge.Root variant="outline" class="border-amber-600 text-amber-600">
									Pending
								</Badge.Root>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => handleOpenChange(false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#if onRemoveMember}
	<RemoveMemberDialog
		bind:open={removeMemberDialogOpen}
		memberEmail={selectedMemberEmail}
		memberName={selectedMemberName}
		{organizationName}
		onRemove={async () => {
			if (selectedMemberUserId && onRemoveMember) {
				await onRemoveMember(selectedMemberUserId);
				removeMemberDialogOpen = false;
				selectedMemberUserId = null;
				selectedMemberEmail = null;
				selectedMemberName = null;
			}
		}}
		onCancel={() => {
			removeMemberDialogOpen = false;
			selectedMemberUserId = null;
			selectedMemberEmail = null;
			selectedMemberName = null;
		}}
	/>
{/if}
