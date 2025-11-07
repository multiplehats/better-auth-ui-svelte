<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { fileToBase64, resizeAndCropImage } from '$lib/utils/image-utils.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCardFooter from '../shared/settings-card-footer.svelte';
	import SettingsCardHeader from '../shared/settings-card-header.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UploadCloud from '@lucide/svelte/icons/upload-cloud';

	export interface UpdateAvatarCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	interface Props extends UpdateAvatarCardProps {}

	let { className, classNames, localization: propLocalization }: Props = $props();

	const {
		hooks: { useSession },
		mutators: { updateUser },
		localization: contextLocalization,
		optimistic,
		avatar,
		toast,
		onSessionChange
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...propLocalization };

	const sessionStore = useSession();
	const sessionData = $derived($sessionStore.data);
	const isPending = $derived($sessionStore.isPending);

	let fileInputRef: HTMLInputElement | null = null;
	let loading = $state(false);

	async function handleAvatarChange(file: File) {
		if (!sessionData || !avatar) return;

		loading = true;
		const resizedFile = await resizeAndCropImage(
			file,
			crypto.randomUUID(),
			avatar.size,
			avatar.extension
		);

		let image: string | undefined | null;

		if (avatar.upload) {
			image = await avatar.upload(resizedFile);
		} else {
			image = await fileToBase64(resizedFile);
		}

		if (!image) {
			loading = false;
			return;
		}

		if (optimistic && !avatar.upload) loading = false;

		try {
			await updateUser({ image });
			await onSessionChange?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}

		loading = false;
	}

	async function handleDeleteAvatar() {
		if (!sessionData) return;

		loading = true;

		try {
			// If a custom storage remover is provided, attempt to clean up the old asset first
			if (sessionData.user.image && avatar?.delete) {
				await avatar.delete(sessionData.user.image);
			}

			await updateUser({ image: null });
			await onSessionChange?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}

		loading = false;
	}

	function openFileDialog() {
		fileInputRef?.click();
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.item(0);
		if (file) handleAvatarChange(file);

		target.value = '';
	}

	function handleCloseAutoFocus(e: Event) {
		e.preventDefault();
	}
</script>

<Card.Root class={cn('w-full pb-0 text-start', className, classNames?.base)}>
	<input
		bind:this={fileInputRef}
		accept="image/*"
		disabled={loading}
		hidden
		type="file"
		onchange={handleFileChange}
	/>

	<div class="flex justify-between">
		<SettingsCardHeader
			className="grow self-start"
			title={mergedLocalization.AVATAR}
			description={mergedLocalization.AVATAR_DESCRIPTION}
			{isPending}
			{classNames}
		/>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="me-6 size-fit rounded-full">
				{#snippet child({ props })}
					<Button {...props} class="size-fit rounded-full" size="icon" variant="ghost">
						<UserAvatar
							isPending={isPending || loading}
							class="size-20 text-2xl"
							classNames={classNames?.avatar}
							user={sessionData?.user}
							localization={mergedLocalization}
						/>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content align="end" onCloseAutoFocus={handleCloseAutoFocus}>
				<DropdownMenu.Item onclick={openFileDialog} disabled={loading}>
					<UploadCloud />
					{mergedLocalization.UPLOAD_AVATAR}
				</DropdownMenu.Item>
				{#if sessionData?.user.image}
					<DropdownMenu.Item onclick={handleDeleteAvatar} disabled={loading} variant="destructive">
						<Trash2 />
						{mergedLocalization.DELETE_AVATAR}
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<SettingsCardFooter
		className="py-5!"
		instructions={mergedLocalization.AVATAR_INSTRUCTIONS}
		{classNames}
		{isPending}
		isSubmitting={loading}
	/>
</Card.Root>
