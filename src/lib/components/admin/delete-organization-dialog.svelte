<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import type { Organization } from '$lib/types/admin.js';
	import { Trash2, AlertTriangle } from '@lucide/svelte';

	let {
		open = $bindable(false),
		organization,
		onDelete,
		onCancel
	}: {
		open: boolean;
		organization: Organization | null;
		onDelete: () => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let isLoading = $state(false);

	async function handleDelete() {
		isLoading = true;
		try {
			await onDelete();
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Trash2 class="h-5 w-5" />
				Delete Organization
			</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete the organization and all
				associated data.
			</Dialog.Description>
		</Dialog.Header>

		{#if organization}
			<div class="grid gap-4 py-4">
				<Alert.Root variant="destructive">
					<AlertTriangle class="h-4 w-4" />
					<Alert.Title>Permanent Deletion</Alert.Title>
					<Alert.Description>
						This will permanently delete the organization, all members, and associated data. This
						action cannot be undone.
					</Alert.Description>
				</Alert.Root>

				<div class="grid gap-2">
					<div class="text-sm font-medium">Organization to Delete</div>
					<div class="rounded-md border p-3 space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Name:</span>
							<span class="text-sm font-medium">{organization.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Slug:</span>
							<span class="text-sm font-medium font-mono">{organization.slug}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={isLoading || !organization}>
				{#if isLoading}
					Deleting...
				{:else}
					Delete Organization
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
