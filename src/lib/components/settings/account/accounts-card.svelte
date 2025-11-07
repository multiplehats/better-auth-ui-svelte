<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCard from '../shared/settings-card.svelte';
	import AccountCell from './account-cell.svelte';

	export interface AccountsCardProps {
		class?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	interface Props extends AccountsCardProps {}

	let { class: className, classNames, localization }: Props = $props();

	const {
		basePath,
		hooks: { useListDeviceSessions, useSession },
		localization: contextLocalization,
		viewPaths,
		navigate
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...localization };

	const deviceSessions = useListDeviceSessions();
	const sessionData = useSession();

	const otherDeviceSessions = $derived(
		(deviceSessions.data || []).filter((ds) => ds.session.id !== $sessionData.data?.session.id)
	);
</script>

<SettingsCard
	{className}
	{classNames}
	title={mergedLocalization.ACCOUNTS}
	description={mergedLocalization.ACCOUNTS_DESCRIPTION}
	actionLabel={mergedLocalization.ADD_ACCOUNT}
	instructions={mergedLocalization.ACCOUNTS_INSTRUCTIONS}
	isPending={deviceSessions.isPending}
	action={() => navigate(`${basePath}/${viewPaths.SIGN_IN}`)}
>
	{#if deviceSessions.data?.length}
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#if $sessionData.data}
				<AccountCell
					{classNames}
					deviceSession={$sessionData.data}
					localization={mergedLocalization}
					refetch={deviceSessions.refetch}
				/>
			{/if}

			{#each otherDeviceSessions as deviceSession (deviceSession.session.id)}
				<AccountCell
					{classNames}
					{deviceSession}
					localization={mergedLocalization}
					refetch={deviceSessions.refetch}
				/>
			{/each}
		</CardContent>
	{/if}
</SettingsCard>
