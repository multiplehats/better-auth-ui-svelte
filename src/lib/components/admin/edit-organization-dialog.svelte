<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Organization } from '$lib/types/admin.js';
	import { Edit, UploadCloud, Trash2 } from '@lucide/svelte';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import { fileToBase64, resizeAndCropImage } from '$lib/utils/image-utils.js';
	import { getLocalizedError } from '$lib/utils/utils.js';
	import OrganizationLogo from '../organization/organization-logo.svelte';

	let {
		open = $bindable(false),
		organization,
		onUpdate,
		onCancel
	}: {
		open: boolean;
		organization: Organization | null;
		onUpdate: () => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	const {
		organization: organizationOptions,
		mutators: { updateOrganization },
		toast
	} = getAuthUIConfig();
	const localization = getLocalization();

	// Form state
	let name = $state('');
	let slug = $state('');
	let logo = $state<string | null>(null);
	let isLoading = $state(false);
	let fileInputRef: HTMLInputElement | null = $state(null);

	// Validation errors
	let errors = $state<{
		name?: string;
		slug?: string;
	}>({});

	// Reset form when dialog opens or organization changes
	$effect(() => {
		if (open && organization) {
			name = organization.name || '';
			slug = organization.slug || '';
			logo = organization.logo || null;
			errors = {};
		}
	});

	// Reset form when dialog closes
	$effect(() => {
		if (!open) {
			name = '';
			slug = '';
			logo = null;
			errors = {};
		}
	});

	// Track if form has changes
	const hasChanges = $derived(
		organization &&
			(name !== organization.name ||
				slug !== organization.slug ||
				logo !== (organization.logo || null))
	);

	// Validate form
	function validateForm(): boolean {
		const newErrors: typeof errors = {};

		if (!name.trim()) {
			newErrors.name = `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`;
		}

		if (!slug.trim()) {
			newErrors.slug = `${localization.ORGANIZATION_SLUG} ${localization.IS_REQUIRED}`;
		} else if (!/^[a-z0-9-]+$/.test(slug)) {
			newErrors.slug = `${localization.ORGANIZATION_SLUG} ${localization.IS_INVALID}`;
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleUpdate() {
		if (!organization || !validateForm()) return;

		isLoading = true;

		try {
			const data: Record<string, unknown> = {};

			if (name !== organization.name) {
				data.name = name;
			}

			if (slug !== organization.slug) {
				data.slug = slug;
			}

			if (logo !== (organization.logo || null)) {
				data.logo = logo || '';
			}

			if (Object.keys(data).length > 0) {
				await updateOrganization({
					organizationId: organization.id,
					data
				});

				toast.success(localization.UPDATED_SUCCESSFULLY);
			}

			await onUpdate();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		} finally {
			isLoading = false;
		}
	}

	// Logo upload handlers
	async function handleLogoChange(file: File) {
		if (!organizationOptions?.logo) {
			// Fallback to base64 if no logo options configured
			const base64 = await fileToBase64(file);
			logo = base64;
			return;
		}

		isLoading = true;

		try {
			const resizedFile = await resizeAndCropImage(
				file,
				crypto.randomUUID(),
				organizationOptions.logo.size,
				organizationOptions.logo.extension
			);

			let image: string | undefined | null;

			if (organizationOptions.logo.upload) {
				image = await organizationOptions.logo.upload(resizedFile);
			} else {
				image = await fileToBase64(resizedFile);
			}

			if (image) {
				logo = image;
			}
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		} finally {
			isLoading = false;
		}
	}

	async function handleDeleteLogo() {
		if (logo && organizationOptions?.logo?.delete) {
			try {
				await organizationOptions.logo.delete(logo);
			} catch {
				// Ignore delete errors, just clear the logo
			}
		}
		logo = null;
	}

	function openFileDialog() {
		fileInputRef?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.item(0);
		if (file) handleLogoChange(file);
		target.value = '';
	}

	function handleCloseAutoFocus(e: Event) {
		e.preventDefault();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Edit class="h-5 w-5" />
				Edit {localization.ORGANIZATION}
			</Dialog.Title>
			<Dialog.Description>
				Update {localization.ORGANIZATION.toLowerCase()} details
			</Dialog.Description>
		</Dialog.Header>

		{#if organization}
			<div class="grid gap-6 py-4">
				<!-- Logo Upload Section -->
				<div class="flex items-center gap-4">
					<input
						bind:this={fileInputRef}
						accept="image/*"
						disabled={isLoading}
						hidden
						type="file"
						onchange={handleFileChange}
					/>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="size-fit rounded-full">
							{#snippet child({ props })}
								<Button
									{...props}
									type="button"
									class="size-fit rounded-full p-0"
									size="icon"
									variant="ghost"
									disabled={isLoading}
								>
									<OrganizationLogo
										isPending={isLoading}
										class="size-16 text-xl"
										organization={{ name: organization.name, logo: logo || undefined }}
										{localization}
									/>
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>

						<DropdownMenu.Content align="start" onCloseAutoFocus={handleCloseAutoFocus}>
							<DropdownMenu.Item onclick={openFileDialog} disabled={isLoading}>
								<UploadCloud class="h-4 w-4" />
								{localization.UPLOAD_LOGO}
							</DropdownMenu.Item>

							{#if logo}
								<DropdownMenu.Item
									onclick={handleDeleteLogo}
									disabled={isLoading}
									class="text-destructive"
								>
									<Trash2 class="h-4 w-4" />
									{localization.DELETE_LOGO}
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<div class="text-sm text-muted-foreground">
						{localization.LOGO_INSTRUCTIONS}
					</div>
				</div>

				<!-- Name Field -->
				<div class="grid gap-2">
					<Label for="name">{localization.ORGANIZATION_NAME}</Label>
					<Input
						id="name"
						bind:value={name}
						placeholder={localization.ORGANIZATION_NAME_PLACEHOLDER}
						disabled={isLoading}
						class={errors.name ? 'border-destructive' : ''}
					/>
					{#if errors.name}
						<p class="text-sm text-destructive">{errors.name}</p>
					{/if}
				</div>

				<!-- Slug Field -->
				<div class="grid gap-2">
					<Label for="slug">{localization.ORGANIZATION_SLUG}</Label>
					<Input
						id="slug"
						bind:value={slug}
						placeholder={localization.ORGANIZATION_SLUG_PLACEHOLDER}
						disabled={isLoading}
						class={errors.slug ? 'border-destructive' : ''}
					/>
					{#if errors.slug}
						<p class="text-sm text-destructive">{errors.slug}</p>
					{/if}
					<p class="text-sm text-muted-foreground">
						{localization.ORGANIZATION_SLUG_INSTRUCTIONS}
					</p>
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel} disabled={isLoading}>
				{localization.CANCEL}
			</Button>
			<Button onclick={handleUpdate} disabled={isLoading || !organization || !hasChanges}>
				{#if isLoading}
					Saving...
				{:else}
					{localization.SAVE}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
