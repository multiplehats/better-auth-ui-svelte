<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCard from '../shared/settings-card.svelte';
	import AccountCell from './account-cell.svelte';

	export interface AccountsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	type Props = AccountsCardProps;

	let { className, classNames, localization }: Props = $props();

	const {
		basePath,
		hooks: { useListDeviceSessions, useSession },
		localization: contextLocalization,
		viewPaths,
		navigate
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...localization };

	const deviceSessionsResult = useListDeviceSessions();
	const sessionStore = useSession();

	// Derive reactive values
	const deviceSessionsData = $derived(deviceSessionsResult.data);
	const deviceSessionsPending = $derived(deviceSessionsResult.isPending);
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);

	const otherDeviceSessions = $derived(
		(deviceSessionsData || []).filter((ds) => ds.session.id !== sessionData?.session.id)
	);
</script>

<SettingsCard
	{className}
	{classNames}
	title={mergedLocalization.ACCOUNTS}
	description={mergedLocalization.ACCOUNTS_DESCRIPTION}
	actionLabel={mergedLocalization.ADD_ACCOUNT}
	instructions={mergedLocalization.ACCOUNTS_INSTRUCTIONS}
	isPending={deviceSessionsPending}
	action={() => navigate(`${basePath}/${viewPaths.SIGN_IN}`)}
>
	{#if deviceSessionsData?.length}
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#if sessionData}
				<AccountCell
					{classNames}
					deviceSession={sessionData}
					localization={mergedLocalization}
					refetch={deviceSessionsResult.refetch}
				/>
			{/if}

			{#each otherDeviceSessions as deviceSession (deviceSession.session.id)}
				<AccountCell
					{classNames}
					{deviceSession}
					localization={mergedLocalization}
					refetch={deviceSessionsResult.refetch}
				/>
			{/each}
		</CardContent>
	{/if}
</SettingsCard>
