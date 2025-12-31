<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { UserWithRole } from '$lib/types/admin.js';
	import { KeyRound, AlertTriangle, Copy, Check } from '@lucide/svelte';

	let {
		open = $bindable(false),
		user,
		onResetPassword,
		onCancel
	}: {
		open: boolean;
		user: UserWithRole | null;
		onResetPassword: (newPassword: string) => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	let isLoading = $state(false);
	let newPassword = $state('');
	let copied = $state(false);

	async function handleReset() {
		isLoading = true;
		try {
			// Generate a random password
			newPassword = Math.random().toString(36).slice(-12);
			await onResetPassword(newPassword);
		} finally {
			isLoading = false;
		}
	}

	async function copyToClipboard() {
		if (newPassword) {
			await navigator.clipboard.writeText(newPassword);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	// Reset state when dialog closes
	$effect(() => {
		if (!open) {
			newPassword = '';
			copied = false;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<KeyRound class="h-5 w-5" />
				Reset Password
			</Dialog.Title>
			<Dialog.Description>
				{#if !newPassword}
					Generate a new password for this user. The password will be displayed only once.
				{:else}
					Password has been reset successfully. Make sure to copy it before closing this dialog.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if user}
			<div class="grid gap-4 py-4">
				{#if !newPassword}
					<Alert.Root variant="default" class="border-amber-500">
						<AlertTriangle class="h-4 w-4 text-amber-500" />
						<Alert.Title>Warning</Alert.Title>
						<Alert.Description>
							This will generate a new random password for the user. The old password will no longer
							work.
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
				{:else}
					<Alert.Root variant="default" class="border-green-500">
						<Check class="h-4 w-4 text-green-500" />
						<Alert.Title>Password Reset Successfully</Alert.Title>
						<Alert.Description>
							The new password is shown below. Make sure to copy it and share it securely with the
							user.
						</Alert.Description>
					</Alert.Root>

					<div class="grid gap-2">
						<Label for="new-password">New Password</Label>
						<div class="flex gap-2">
							<Input
								id="new-password"
								value={newPassword}
								readonly
								class="font-mono"
								onclick={(e) => e.currentTarget.select()}
							/>
							<Button variant="outline" size="icon" onclick={copyToClipboard}>
								{#if copied}
									<Check class="h-4 w-4 text-green-500" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</Button>
						</div>
						<p class="text-xs text-muted-foreground">
							Click the password to select it, or use the copy button.
						</p>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			{#if !newPassword}
				<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
				<Button variant="destructive" onclick={handleReset} disabled={isLoading || !user}>
					{#if isLoading}
						Resetting...
					{:else}
						Reset Password
					{/if}
				</Button>
			{:else}
				<Button onclick={onCancel}>Close</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
