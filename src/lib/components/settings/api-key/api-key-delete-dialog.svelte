<script lang="ts">
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import { useLang } from '$lib/hooks/use-lang.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { ApiKey } from '$lib/types/api-key.js';
	import type { Refetch } from '$lib/types/refetch.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		apiKey: ApiKey;
		localization?: Partial<AuthLocalization>;
		refetch?: Refetch;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let {
		classNames,
		apiKey,
		localization: propLocalization,
		refetch,
		open = $bindable(false),
		onOpenChange
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const toast = config.toast;
	const mutators = config.mutators;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const { lang } = useLang();
	let isLoading = $state(false);

	async function handleDelete() {
		isLoading = true;

		try {
			await mutators.deleteApiKey({ keyId: apiKey.id });
			await refetch?.();
			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}

		isLoading = false;
	}

	// Format expiration date or show "Never expires"
	function formatExpiration() {
		if (!apiKey.expiresAt) return localization.NEVER_EXPIRES;

		const expiresDate = new Date(apiKey.expiresAt);
		return `${localization.EXPIRES} ${expiresDate.toLocaleDateString(lang ?? 'en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})}`;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.DELETE} {localization.API_KEY}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.DELETE_API_KEY_CONFIRM}
			</Dialog.Description>
		</Dialog.Header>

		<Card class={cn('my-2 flex-row items-center gap-3 px-4 py-3', classNames?.cell)}>
			<KeyRound class={cn('size-4', classNames?.icon)} />

			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold">
						{apiKey.name}
					</span>

					<span class="text-sm text-muted-foreground">
						{apiKey.start}{'******'}
					</span>
				</div>

				<div class="text-xs text-muted-foreground">
					{formatExpiration()}
				</div>
			</div>
		</Card>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="secondary"
				onclick={() => handleOpenChange(false)}
				disabled={isLoading}
				class={cn(classNames?.button, classNames?.secondaryButton)}
			>
				{localization.CANCEL}
			</Button>

			<Button
				type="button"
				variant="destructive"
				onclick={handleDelete}
				disabled={isLoading}
				class={cn(classNames?.button, classNames?.destructiveButton)}
			>
				{#if isLoading}
					<Loader2 class="animate-spin" />
				{/if}
				{localization.DELETE}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
