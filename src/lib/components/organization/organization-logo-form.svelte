<script lang="ts">
	import type { Organization } from 'better-auth/plugins/organization';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UploadCloud from '@lucide/svelte/icons/upload-cloud';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { fileToBase64, resizeAndCropImage } from '$lib/utils/image-utils.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCardFooter from '../settings/shared/settings-card-footer.svelte';
	import SettingsCardHeader from '../settings/shared/settings-card-header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import OrganizationLogo from './organization-logo.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';

	export interface OrganizationLogoFormProps {
		organization: Organization;
		class?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
	}

	interface Props extends OrganizationLogoFormProps {}

	let { organization, class: className, classNames, localization, ...restProps }: Props = $props();

	const {
		hooks: { useHasPermission },
		organization: organizationOptions,
		mutators: { updateOrganization },
		toast
	} = getAuthUIConfig();

	const { refetch: refetchOrganization } = useCurrentOrganization({
		slug: organization.slug
	});

	const permissionStore = useHasPermission({
		organizationId: organization.id,
		permissions: {
			organization: ['update']
		}
	} as any);

	const hasPermissionData = $derived(permissionStore?.data);
	const hasPermission = $derived(hasPermissionData?.success ?? false);
	const permissionPending = $derived(permissionStore?.isPending ?? false);

	const isPending = $derived(permissionPending);

	let fileInputRef: HTMLInputElement | null = $state(null);
	let loading = $state(false);

	async function handleLogoChange(file: File) {
		if (!organizationOptions?.logo || !hasPermission) return;

		loading = true;

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

		if (!image) {
			loading = false;
			return;
		}

		try {
			await updateOrganization({
				organizationId: organization.id,
				data: { logo: image }
			});

			await refetchOrganization?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		loading = false;
	}

	async function handleDeleteLogo() {
		if (!hasPermission) return;

		loading = true;

		try {
			if (organization.logo) {
				await organizationOptions?.logo?.delete?.(organization.logo);
			}

			await updateOrganization({
				organizationId: organization.id,
				data: { logo: '' }
			});

			await refetchOrganization?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		loading = false;
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

<Card.Root class={cn('w-full pb-0 text-start', className, classNames?.base)} {...restProps}>
	<input
		bind:this={fileInputRef}
		accept="image/*"
		disabled={loading || !hasPermission}
		hidden
		type="file"
		onchange={handleFileChange}
	/>

	<div class="flex justify-between">
		<SettingsCardHeader
			className="grow self-start"
			title={localization.LOGO}
			description={localization.LOGO_DESCRIPTION}
			{isPending}
			{classNames}
		/>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="me-6 size-fit rounded-full">
				{#snippet child({ props })}
					<Button
						{...props}
						type="button"
						class="size-fit rounded-full"
						size="icon"
						variant="ghost"
						disabled={!hasPermission}
					>
						<OrganizationLogo
							isPending={isPending || loading}
							class="size-20 text-2xl"
							classNames={classNames?.avatar}
							{organization}
							{localization}
						/>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content align="end" onCloseAutoFocus={handleCloseAutoFocus}>
				<DropdownMenu.Item onclick={openFileDialog} disabled={loading || !hasPermission}>
					<UploadCloud />
					{localization.UPLOAD_LOGO}
				</DropdownMenu.Item>

				{#if organization.logo}
					<DropdownMenu.Item
						onclick={handleDeleteLogo}
						disabled={loading || !hasPermission}
						variant="destructive"
					>
						<Trash2 />
						{localization.DELETE_LOGO}
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<SettingsCardFooter
		className="py-5!"
		instructions={localization.LOGO_INSTRUCTIONS}
		{classNames}
		{isPending}
		isSubmitting={loading}
	/>
</Card.Root>
