<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		apiKey: string;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		classNames,
		apiKey,
		localization: propLocalization,
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const contextLocalization = getLocalization();
	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let copied = $state(false);

	function handleCopy() {
		navigator.clipboard.writeText(apiKey);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()} class={classNames?.dialog?.content}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.API_KEY_CREATED}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.CREATE_API_KEY_SUCCESS}
			</Dialog.Description>
		</Dialog.Header>

		<div class="rounded-md bg-muted p-4 font-mono text-sm break-all">
			{apiKey}
		</div>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="outline"
				onclick={handleCopy}
				disabled={copied}
				class={cn(classNames?.button, classNames?.outlineButton)}
			>
				{#if copied}
					<Check class={classNames?.icon} />
					{localization.COPIED_TO_CLIPBOARD}
				{:else}
					<Copy class={classNames?.icon} />
					{localization.COPY_TO_CLIPBOARD}
				{/if}
			</Button>

			<Button
				type="button"
				variant="default"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.primaryButton)}
			>
				{localization.DONE}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
