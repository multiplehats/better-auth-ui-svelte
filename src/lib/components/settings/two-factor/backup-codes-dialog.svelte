<script lang="ts">
	import { Check, Copy } from '@lucide/svelte';
	import { getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		backupCodes: string[];
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { classNames, backupCodes, open = $bindable(false), onOpenChange }: Props = $props();

	const localization = getLocalization();

	let copied = $state(false);

	function handleCopy() {
		const codeText = backupCodes.join('\n');
		navigator.clipboard.writeText(codeText);
		copied = true;
		setTimeout(() => (copied = false), 2000);
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
				{localization.BACKUP_CODES}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.BACKUP_CODES_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2">
			{#each backupCodes as code, index (index)}
				<div class="rounded-md bg-muted p-2 text-center font-mono text-sm">
					{code}
				</div>
			{/each}
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
					{localization.COPY_ALL_CODES}
				{/if}
			</Button>

			<Button
				type="button"
				variant="default"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.primaryButton)}
			>
				{localization.CONTINUE}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
