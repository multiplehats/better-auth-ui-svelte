<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import type { UserWithRole } from '$lib/types/admin.js';
	import { LogOut, AlertTriangle } from '@lucide/svelte';

	let {
		open = $bindable(false),
		user,
		onRevoke,
		onCancel
	}: {
		open: boolean;
		user: UserWithRole | null;
		onRevoke: () => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let isLoading = $state(false);

	async function handleRevoke() {
		isLoading = true;
		try {
			await onRevoke();
		} finally {
			isLoading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<LogOut class="h-5 w-5" />
				Revoke All Sessions
			</Dialog.Title>
			<Dialog.Description>
				This will log the user out from all devices and browsers where they are currently signed
				in.
			</Dialog.Description>
		</Dialog.Header>

		{#if user}
			<div class="grid gap-4 py-4">
				<Alert.Root variant="default" class="border-amber-500">
					<AlertTriangle class="h-4 w-4 text-amber-500" />
					<Alert.Title>Warning</Alert.Title>
					<Alert.Description>
						The user will be immediately logged out from all active sessions. They will need to
						sign in again.
					</Alert.Description>
				</Alert.Root>

				<div class="grid gap-2">
					<div class="text-sm font-medium">User Details</div>
					<div class="rounded-md border p-3 space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Email:</span>
							<span class="text-sm font-medium">{user.email}</span>
						</div>
						{#if user.name}
							<div class="flex justify-between">
								<span class="text-sm text-muted-foreground">Name:</span>
								<span class="text-sm font-medium">{user.name}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button variant="destructive" onclick={handleRevoke} disabled={isLoading || !user}>
				{#if isLoading}
					Revoking...
				{:else}
					Revoke Sessions
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
