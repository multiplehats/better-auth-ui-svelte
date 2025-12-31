<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { UserPlus } from '@lucide/svelte';
	import { getLocalization } from '$lib/context/auth-ui-config.svelte';

	let {
		open = $bindable(false),
		roles,
		onCreate,
		onCancel
	}: {
		open: boolean;
		roles: string[];
		onCreate: (
			email: string,
			password: string,
			name: string,
			role?: string,
			data?: Record<string, any>
		) => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	const contextLocalization = getLocalization();
	const localization = $derived({ ...contextLocalization });

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let selectedRole = $state<string | undefined>('user');
	let customData = $state('');
	let isLoading = $state(false);
	let errors = $state<{
		email?: string;
		password?: string;
		name?: string;
		customData?: string;
	}>({});

	function validateForm(): boolean {
		const newErrors: typeof errors = {};

		// Email validation
		if (!email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'Invalid email format';
		}

		// Password validation
		if (!password) {
			newErrors.password = 'Password is required';
		} else if (password.length < 8) {
			newErrors.password = 'Password must be at least 8 characters';
		}

		// Name validation
		if (!name.trim()) {
			newErrors.name = 'Name is required';
		}

		// Custom data validation
		if (customData.trim()) {
			try {
				JSON.parse(customData);
			} catch (e) {
				newErrors.customData = 'Invalid JSON format';
			}
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleCreate() {
		if (!validateForm()) return;

		isLoading = true;
		try {
			let parsedData: Record<string, any> | undefined;
			if (customData.trim()) {
				try {
					parsedData = JSON.parse(customData);
				} catch (e) {
					// Already validated, this shouldn't happen
				}
			}

			await onCreate(email.trim(), password, name.trim(), selectedRole, parsedData);

			// Reset form on success
			resetForm();
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		email = '';
		password = '';
		name = '';
		selectedRole = 'user';
		customData = '';
		errors = {};
	}

	// Reset form when dialog closes
	$effect(() => {
		if (!open) {
			resetForm();
		}
	});

	const canCreate = $derived(email.trim() && password && name.trim());
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<UserPlus class="h-5 w-5" />
				Create New User
			</Dialog.Title>
			<Dialog.Description>
				Create a new user account. All required fields must be filled out.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="email">
					Email <span class="text-destructive">*</span>
				</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder="user@example.com"
					class={errors.email ? 'border-destructive' : ''}
					disabled={isLoading}
				/>
				{#if errors.email}
					<p class="text-xs text-destructive">{errors.email}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="password">
					Password <span class="text-destructive">*</span>
				</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Enter a secure password"
					class={errors.password ? 'border-destructive' : ''}
					disabled={isLoading}
				/>
				{#if errors.password}
					<p class="text-xs text-destructive">{errors.password}</p>
				{:else}
					<p class="text-xs text-muted-foreground">Minimum 8 characters</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="name">
					Name <span class="text-destructive">*</span>
				</Label>
				<Input
					id="name"
					type="text"
					bind:value={name}
					placeholder="James Smith"
					class={errors.name ? 'border-destructive' : ''}
					disabled={isLoading}
				/>
				{#if errors.name}
					<p class="text-xs text-destructive">{errors.name}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="role">Role</Label>
				<Select.Root type="single" bind:value={selectedRole}>
					<Select.Trigger id="role" disabled={isLoading}>
						{#if selectedRole}
							<span class="capitalize">{selectedRole}</span>
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

			<div class="grid gap-2">
				<Label for="customData">Custom Data (Optional)</Label>
				<Textarea
					id="customData"
					bind:value={customData}
					placeholder={'{"customField": "customValue"}'}
					rows={3}
					class={errors.customData ? 'border-destructive font-mono text-xs' : 'font-mono text-xs'}
					disabled={isLoading}
				/>
				{#if errors.customData}
					<p class="text-xs text-destructive">{errors.customData}</p>
				{:else}
					<p class="text-xs text-muted-foreground">Enter valid JSON for additional user fields</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>Cancel</Button>
			<Button onclick={handleCreate} disabled={isLoading || !canCreate}>
				{#if isLoading}
					Creating...
				{:else}
					Create User
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
