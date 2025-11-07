<script lang="ts">
	import KeyRound from '@lucide/svelte/icons/key-round';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization, ApiKey, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import ApiKeyDeleteDialog from './api-key-delete-dialog.svelte';
	import { useLang } from '$lib/hooks/use-lang.svelte.js';

	export interface ApiKeyCellProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		apiKey: ApiKey;
		localization?: Partial<AuthLocalization>;
		refetch?: Refetch;
	}

	interface Props extends ApiKeyCellProps {}

	let {
		className,
		classNames,
		apiKey,
		localization: propLocalization,
		refetch
	}: Props = $props();

	const { localization: contextLocalization } = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const { lang } = useLang();

	let showDeleteDialog = $state(false);

	// Format expiration date or show "Never expires"
	const formatExpiration = () => {
		if (!apiKey.expiresAt) return mergedLocalization.NEVER_EXPIRES;

		const expiresDate = new Date(apiKey.expiresAt);
		return `${mergedLocalization.EXPIRES} ${expiresDate.toLocaleDateString(
			lang ?? 'en',
			{
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}
		)}`;
	};
</script>

<Card class={cn('flex-row items-center gap-3 truncate px-4 py-3', className, classNames?.cell)}>
	<KeyRound class={cn('size-4 flex-shrink-0', classNames?.icon)} />

	<div class="flex flex-col truncate">
		<div class="flex items-center gap-2">
			<span class="truncate font-semibold text-sm">
				{apiKey.name}
			</span>

			<span class="flex-1 truncate text-muted-foreground text-sm">
				{apiKey.start}{'******'}
			</span>
		</div>

		<div class="truncate text-muted-foreground text-xs">
			{formatExpiration()}
		</div>
	</div>

	<Button
		class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
		size="sm"
		variant="outline"
		onclick={() => (showDeleteDialog = true)}
	>
		{mergedLocalization.DELETE}
	</Button>
</Card>

<ApiKeyDeleteDialog
	{classNames}
	{apiKey}
	localization={mergedLocalization}
	open={showDeleteDialog}
	onOpenChange={(open) => (showDeleteDialog = open)}
	{refetch}
/>
