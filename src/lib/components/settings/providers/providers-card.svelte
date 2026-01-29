<script lang="ts">
	import type { Account } from 'better-auth';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { socialProviders } from '$lib/social-providers.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCard from '../shared/settings-card.svelte';
	import SettingsCellSkeleton from '../skeletons/settings-cell-skeleton.svelte';
	import ProviderCell from './provider-cell.svelte';

	export interface ProvidersCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		accounts?: Account[] | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
		skipHook?: boolean;
		refetch?: Refetch;
	}

	type Props = ProvidersCardProps;

	let { className, classNames, accounts, isPending, localization, skipHook, refetch }: Props =
		$props();

	const {
		hooks: { useListAccounts },
		localization: contextLocalization,
		social,
		genericOAuth
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...localization });

	// Use hook if skipHook is false
	let listAccountsResult: ReturnType<typeof useListAccounts> | undefined = undefined;
	const shouldSkipHook = $derived(skipHook);
	if (!shouldSkipHook) {
		listAccountsResult = useListAccounts();
	}

	// Derive accounts, isPending, and refetch from hook if needed
	const derivedAccounts = $derived(shouldSkipHook ? accounts : listAccountsResult?.data);
	const derivedIsPending = $derived(shouldSkipHook ? isPending : listAccountsResult?.isPending);
	const derivedRefetch = $derived(shouldSkipHook ? refetch : listAccountsResult?.refetch);
</script>

<SettingsCard
	{className}
	{classNames}
	title={mergedLocalization.PROVIDERS}
	description={mergedLocalization.PROVIDERS_DESCRIPTION}
	isPending={derivedIsPending}
>
	<Card.Content class={cn('grid gap-4', classNames?.content)}>
		{#if derivedIsPending}
			{#each social?.providers ?? [] as provider (provider)}
				<SettingsCellSkeleton {classNames} />
			{/each}
		{:else}
			{#each social?.providers ?? [] as provider (provider)}
				{@const socialProvider = socialProviders.find((sp) => sp.provider === provider)}
				{#if socialProvider}
					<ProviderCell
						{classNames}
						account={derivedAccounts?.find((acc) => acc.providerId === provider)}
						provider={socialProvider}
						refetch={derivedRefetch}
					/>
				{/if}
			{/each}

			{#each genericOAuth?.providers ?? [] as provider (provider.provider)}
				<ProviderCell
					{classNames}
					account={derivedAccounts?.find((acc) => acc.providerId === provider.provider)}
					{provider}
					refetch={derivedRefetch}
					other
				/>
			{/each}
		{/if}
	</Card.Content>
</SettingsCard>
