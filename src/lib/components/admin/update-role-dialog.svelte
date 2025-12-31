<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { UserWithRole } from '$lib/types/admin.js';
	import { ShieldCheck } from '@lucide/svelte';
	import { getLocalization } from '$lib/context/auth-ui-config.svelte';

	let {
		open = $bindable(false),
		user,
		currentRole,
		roles,
		onUpdate,
		onCancel
	}: {
		open: boolean;
		user: UserWithRole | null;
		currentRole: string;
		roles: string[];
		onUpdate: (role: string) => void | Promise<void>;
		onCancel: () => void;
	} = $props();
	const contextLocalization = getLocalization();

	const localization = $derived({ ...contextLocalization });

	let selectedRole = $state<string | undefined>(undefined);
	let isLoading = $state(false);

	// Reset selected role when dialog opens with a new user
	$effect(() => {
		if (open && user) {
			selectedRole = user.role;
		}
	});

	async function handleUpdate() {
		if (!selectedRole) return;

		isLoading = true;
		try {
			await onUpdate(selectedRole);
		} finally {
			isLoading = false;
		}
	}

	const canUpdate = $derived(selectedRole && selectedRole !== currentRole);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<ShieldCheck class="h-5 w-5" />
				Update User Role
			</Dialog.Title>
			<Dialog.Description>
				Change the role and permissions for this user. This will take effect immediately.
			</Dialog.Description>
		</Dialog.Header>

		{#if user}
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<div class="text-sm font-medium">User</div>
					<div class="rounded-md border p-3">
						<div class="font-medium">{user.email}</div>
						{#if user.name}
							<div class="text-sm text-muted-foreground">{user.name}</div>
						{/if}
						<div class="mt-2 text-xs text-muted-foreground">
							Current role: <span class="font-medium capitalize">{currentRole}</span>
						</div>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="role">New Role</Label>
					<Select.Root type="single" bind:value={selectedRole}>
						<Select.Trigger id="role">
							{#if selectedRole}
								<span>{selectedRole}</span>
							{:else}
								<span>{localization.SELECT_ROLE}</span>
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each roles as role (role)}
								<Select.Item value={role} label={role}>
									<div class="flex flex-col">
										<span class="font-medium capitalize">{role}</span>
										<span class="text-xs text-muted-foreground">
											{#if role === 'admin'}
												Full system access and permissions
											{:else if role === 'moderator'}
												Limited administrative permissions
											{:else}
												Standard user permissions
											{/if}
										</span>
									</div>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				{#if selectedRole === currentRole}
					<p class="text-sm text-muted-foreground">
						This is the user's current role. Select a different role to update.
					</p>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button onclick={handleUpdate} disabled={isLoading || !canUpdate}>
				{#if isLoading}
					Updating...
				{:else}
					Update Role
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
