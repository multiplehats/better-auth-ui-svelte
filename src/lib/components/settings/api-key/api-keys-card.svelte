<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import SettingsCard, { type SettingsCardClassNames } from '../shared/settings-card.svelte';
	import ApiKeyCell from './api-key-cell.svelte';
	import ApiKeyDisplayDialog from './api-key-display-dialog.svelte';
	import CreateApiKeyDialog from './create-api-key-dialog.svelte';

	export interface ApiKeysCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		organizationId?: string;
	}

	type Props = ApiKeysCardProps;

	let {
		className,
		classNames,
		localization: propLocalization,
		organizationId,
		...restProps
	}: Props = $props();

	const {
		hooks: { useListApiKeys },
		localization: contextLocalization
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const listApiKeys = useListApiKeys();
	const apiKeys = $derived(listApiKeys.data);
	const isPending = $derived(listApiKeys.isPending);
	const refetch = $derived(listApiKeys.refetch);

	// Filter API keys by organizationId
	const filteredApiKeys = $derived(
		!apiKeys
			? null
			: !organizationId
				? apiKeys
				: apiKeys.filter((apiKey) => organizationId === apiKey.metadata?.organizationId)
	);

	let createDialogOpen = $state(false);
	let displayDialogOpen = $state(false);
	let createdApiKey = $state('');

	const handleCreateApiKey = (apiKey: string) => {
		createdApiKey = apiKey;
		displayDialogOpen = true;
	};
</script>

<SettingsCard
	{className}
	{classNames}
	actionLabel={mergedLocalization.CREATE_API_KEY}
	description={mergedLocalization.API_KEYS_DESCRIPTION}
	instructions={mergedLocalization.API_KEYS_INSTRUCTIONS}
	{isPending}
	title={mergedLocalization.API_KEYS}
	action={() => (createDialogOpen = true)}
	{...restProps}
>
	{#if filteredApiKeys && filteredApiKeys.length > 0}
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#each filteredApiKeys as apiKey (apiKey.id)}
				<ApiKeyCell {classNames} {apiKey} localization={mergedLocalization} {refetch} />
			{/each}
		</CardContent>
	{/if}
</SettingsCard>

<CreateApiKeyDialog
	{classNames}
	localization={mergedLocalization}
	open={createDialogOpen}
	onOpenChange={(open) => (createDialogOpen = open)}
	onSuccess={handleCreateApiKey}
	{refetch}
	{organizationId}
/>

<ApiKeyDisplayDialog
	{classNames}
	apiKey={createdApiKey}
	localization={mergedLocalization}
	open={displayDialogOpen}
	onOpenChange={(open) => (displayDialogOpen = open)}
/>
