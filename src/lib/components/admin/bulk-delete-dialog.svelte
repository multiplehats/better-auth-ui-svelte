<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Trash2, AlertTriangle } from '@lucide/svelte';

	type ItemType = 'user' | 'organization';

	let {
		open = $bindable(false),
		itemType,
		itemCount,
		items = [],
		onDelete,
		onCancel
	}: {
		open: boolean;
		itemType: ItemType;
		itemCount: number;
		items?: Array<{ id: string; name: string }>;
		onDelete: () => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let isLoading = $state(false);

	const itemLabel = $derived(itemType === 'user' ? 'user' : 'organization');
	const itemLabelPlural = $derived(itemType === 'user' ? 'users' : 'organizations');

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
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Trash2 class="h-5 w-5" />
				Delete {itemCount} {itemCount === 1 ? itemLabel : itemLabelPlural}
			</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete the selected {itemCount === 1
					? itemLabel
					: itemLabelPlural} and all associated data.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<Alert.Root variant="destructive">
				<AlertTriangle class="h-4 w-4" />
				<Alert.Title>Permanent Deletion</Alert.Title>
				<Alert.Description>
					This will permanently delete {itemCount}
					{itemCount === 1 ? itemLabel : itemLabelPlural} and all associated data. This action cannot
					be undone.
				</Alert.Description>
			</Alert.Root>

			{#if items.length > 0 && items.length <= 10}
				<div class="grid gap-2">
					<div class="text-sm font-medium">
						{itemCount === 1 ? itemLabel : itemLabelPlural} to delete:
					</div>
					<div class="rounded-md border p-3 max-h-[200px] overflow-y-auto">
						<ul class="space-y-1 text-sm">
							{#each items as item}
								<li class="py-1">• {item.name}</li>
							{/each}
						</ul>
					</div>
				</div>
			{:else if itemCount > 10}
				<div class="rounded-md border p-3">
					<p class="text-sm text-muted-foreground">
						{itemCount}
						{itemLabelPlural} will be deleted (too many to list)
					</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={isLoading || itemCount === 0}>
				{#if isLoading}
					Deleting...
				{:else}
					Delete {itemCount} {itemCount === 1 ? itemLabel : itemLabelPlural}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
