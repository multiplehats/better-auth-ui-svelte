<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UploadCloud from '@lucide/svelte/icons/upload-cloud';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { fileToBase64, resizeAndCropImage } from '$lib/utils/image-utils.js';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import OrganizationLogo from './organization-logo.svelte';

	export interface SettingsCardClassNames {
		title?: string;
		description?: string;
		button?: string;
		primaryButton?: string;
		outlineButton?: string;
		dialog?: {
			content?: string;
			header?: string;
			footer?: string;
		};
	}

	interface Props {
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		localization?: Partial<AuthLocalization>;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		localization: propLocalization
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const organizationOptions = config.organization;
	const navigate = config.navigate;
	const toast = config.toast;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let logo = $state<string | null>(null);
	let logoPending = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	function openFileDialog() {
		fileInputRef?.click();
	}

	// Form validation schema - localization captured at init for validation messages
	// svelte-ignore state_referenced_locally -- form schema is created once with initial localization values
	const initLocalization = { ...contextLocalization, ...propLocalization };
	const formSchema = z.object({
		logo: z.string().optional(),
		name: z.string().min(1, {
			message: `${initLocalization.ORGANIZATION_NAME} ${initLocalization.IS_REQUIRED}`
		}),
		slug: z
			.string()
			.min(1, {
				message: `${initLocalization.ORGANIZATION_SLUG} ${initLocalization.IS_REQUIRED}`
			})
			.regex(/^[a-z0-9-]+$/, {
				message: `${initLocalization.ORGANIZATION_SLUG} ${initLocalization.IS_INVALID}`
			})
	});

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			logo: '',
			name: '',
			slug: ''
		},
		onSubmit: async ({ value }) => {
			try {
				const organization = await authClient.organization.create({
					name: value.name,
					slug: value.slug,
					logo: value.logo,
					fetchOptions: { throw: true }
				});

				if (organizationOptions?.pathMode === 'slug') {
					navigate(`${organizationOptions.basePath}/${organization.slug}`);
					return;
				}

				await authClient.organization.setActive({
					organizationId: organization.id
				});

				onOpenChange?.(false);
				open = false;
				form.reset();
				logo = null;

				toast.success(
					localization.CREATE_ORGANIZATION_SUCCESS || 'Organization created successfully'
				);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	async function handleLogoChange(file: File) {
		if (!organizationOptions?.logo) return;

		logoPending = true;

		try {
			const resizedFile = await resizeAndCropImage(
				file,
				crypto.randomUUID(),
				organizationOptions.logo.size,
				organizationOptions.logo.extension
			);

			let image: string | undefined | null;

			if (organizationOptions?.logo.upload) {
				image = await organizationOptions.logo.upload(resizedFile);
			} else {
				image = await fileToBase64(resizedFile);
			}

			logo = image || null;
			form.setFieldValue('logo', image || '');
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		logoPending = false;
	}

	async function deleteLogo() {
		logoPending = true;

		const currentUrl = logo || undefined;
		if (currentUrl && organizationOptions?.logo?.delete) {
			await organizationOptions.logo.delete(currentUrl);
		}

		logo = null;
		form.setFieldValue('logo', '');
		logoPending = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}

	// Watch the name field for reactive display
	const nameFieldValue = $derived(form.state.values.name);
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.CREATE_ORGANIZATION}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.ORGANIZATIONS_INSTRUCTIONS}
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="space-y-6"
		>
			{#if organizationOptions?.logo}
				<form.Field name="logo">
					{#snippet children(field)}
						<div class="space-y-2">
							<input
								bind:this={fileInputRef}
								accept="image/*"
								disabled={logoPending}
								hidden
								type="file"
								onchange={(e) => {
									const file = e.currentTarget.files?.item(0);
									if (file) handleLogoChange(file);
									e.currentTarget.value = '';
								}}
							/>

							<Label>{localization.LOGO}</Label>

							<div class="flex items-center gap-4">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button
												{...props}
												class="size-fit rounded-full"
												size="icon"
												type="button"
												variant="ghost"
											>
												<OrganizationLogo
													class="size-16"
													isPending={logoPending}
													{localization}
													organization={{
														name: nameFieldValue,
														logo
													}}
												/>
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>

									<DropdownMenu.Content align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
										<DropdownMenu.Item onclick={openFileDialog} disabled={logoPending}>
											<UploadCloud />
											{localization.UPLOAD_LOGO}
										</DropdownMenu.Item>

										{#if logo}
											<DropdownMenu.Item
												onclick={deleteLogo}
												disabled={logoPending}
												class="text-destructive focus:text-destructive"
											>
												<Trash2 />
												{localization.DELETE_LOGO}
											</DropdownMenu.Item>
										{/if}
									</DropdownMenu.Content>
								</DropdownMenu.Root>

								<Button
									disabled={logoPending}
									variant="outline"
									onclick={openFileDialog}
									type="button"
								>
									{#if logoPending}
										<Loader2 class="animate-spin" />
									{/if}
									{localization.UPLOAD}
								</Button>
							</div>

							{#if field.state.meta.errors.length > 0}
								<p class="mt-2 text-sm font-medium text-destructive">
									{getFieldError(field.state.meta.errors[0])}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
			{/if}

			<form.Field name="name" validators={{ onChange: formSchema.shape.name }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for="name">{localization.ORGANIZATION_NAME}</Label>

						<Input
							id="name"
							placeholder={localization.ORGANIZATION_NAME_PLACEHOLDER}
							value={field.state.value}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							onblur={field.handleBlur}
							disabled={form.state.isSubmitting}
						/>

						{#if field.state.meta.errors.length > 0}
							<p class="mt-2 text-sm font-medium text-destructive">
								{getFieldError(field.state.meta.errors[0])}
							</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<form.Field name="slug" validators={{ onChange: formSchema.shape.slug }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for="slug">{localization.ORGANIZATION_SLUG}</Label>

						<Input
							id="slug"
							placeholder={localization.ORGANIZATION_SLUG_PLACEHOLDER}
							value={field.state.value}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							onblur={field.handleBlur}
							disabled={form.state.isSubmitting}
						/>

						{#if field.state.meta.errors.length > 0}
							<p class="mt-2 text-sm font-medium text-destructive">
								{getFieldError(field.state.meta.errors[0])}
							</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer class={classNames?.dialog?.footer}>
				<Button
					type="button"
					variant="outline"
					onclick={() => handleOpenChange(false)}
					class={cn(classNames?.button, classNames?.outlineButton)}
				>
					{localization.CANCEL}
				</Button>

				<Button
					type="submit"
					class={cn(classNames?.button, classNames?.primaryButton)}
					disabled={form.state.isSubmitting}
				>
					{#if form.state.isSubmitting}
						<Loader2 class="animate-spin" />
					{/if}
					{localization.CREATE_ORGANIZATION}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
