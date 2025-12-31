<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { UserMinus, AlertTriangle } from '@lucide/svelte';

	let {
		open = $bindable(false),
		memberEmail,
		memberName,
		organizationName,
		onRemove,
		onCancel
	}: {
		open: boolean;
		memberEmail: string | null;
		memberName?: string | null;
		organizationName: string;
		onRemove: () => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let isLoading = $state(false);

	async function handleRemove() {
		isLoading = true;
		try {
			await onRemove();
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<UserMinus class="h-5 w-5" />
				Remove Member
			</Dialog.Title>
			<Dialog.Description>
				Remove this member from the organization. They will lose access to all organization
				resources.
			</Dialog.Description>
		</Dialog.Header>

		{#if memberEmail}
			<div class="grid gap-4 py-4">
				<Alert.Root variant="default" class="border-amber-500">
					<AlertTriangle class="h-4 w-4 text-amber-500" />
					<Alert.Title>Warning</Alert.Title>
					<Alert.Description>
						This member will be removed from "{organizationName}" and will lose access to all
						organization resources.
					</Alert.Description>
				</Alert.Root>

				<div class="grid gap-2">
					<div class="text-sm font-medium">Member Details</div>
					<div class="rounded-md border p-3 space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Email:</span>
							<span class="text-sm font-medium">{memberEmail}</span>
						</div>
						{#if memberName}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Name:</span>
								<span class="text-sm font-medium">{memberName}</span>
							</div>
						{/if}
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Organization:</span>
							<span class="text-sm font-medium">{organizationName}</span>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button variant="destructive" onclick={handleRemove} disabled={isLoading || !memberEmail}>
				{#if isLoading}
					Removing...
				{:else}
					Remove Member
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
