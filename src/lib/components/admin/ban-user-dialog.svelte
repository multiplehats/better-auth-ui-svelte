<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { UserWithRole } from '$lib/types/admin.js';
	import { Ban } from '@lucide/svelte';

	let {
		open = $bindable(false),
		user,
		onBan,
		onCancel
	}: {
		open: boolean;
		user: UserWithRole | null;
		onBan: (reason?: string, expiresAt?: Date) => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let reason = $state('');
	let expirationDate = $state('');
	let isPermanent = $state(true);
	let isLoading = $state(false);

	async function handleBan() {
		isLoading = true;
		try {
			const expiresAt = isPermanent || !expirationDate ? undefined : new Date(expirationDate);
			await onBan(reason || undefined, expiresAt);
			// Reset form
			reason = '';
			expirationDate = '';
			isPermanent = true;
		} finally {
			isLoading = false;
		}
	}

	// Reset form when dialog opens/closes
	$effect(() => {
		if (!open) {
			reason = '';
			expirationDate = '';
			isPermanent = true;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Ban class="h-5 w-5" />
				Ban User
			</Dialog.Title>
			<Dialog.Description>
				Suspend user access to the application. You can specify a reason and expiration date.
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
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="reason">Reason (optional)</Label>
					<Textarea
						id="reason"
						bind:value={reason}
						placeholder="Enter the reason for banning this user..."
						rows={3}
					/>
				</div>

				<div class="grid gap-2">
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="permanent"
							bind:checked={isPermanent}
							class="h-4 w-4 rounded border-gray-300"
						/>
						<Label for="permanent" class="font-normal cursor-pointer">Permanent ban</Label>
					</div>
				</div>

				{#if !isPermanent}
					<div class="grid gap-2">
						<Label for="expiration">Expiration Date</Label>
						<Input
							id="expiration"
							type="datetime-local"
							bind:value={expirationDate}
							min={new Date().toISOString().slice(0, 16)}
						/>
						<p class="text-xs text-muted-foreground">
							The ban will automatically expire on this date
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button variant="destructive" onclick={handleBan} disabled={isLoading || !user}>
				{#if isLoading}
					Banning...
				{:else}
					Ban User
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
