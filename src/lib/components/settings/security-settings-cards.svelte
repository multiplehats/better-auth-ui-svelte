<script lang="ts" module>
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from './shared/settings-card.svelte';

	export interface SecuritySettingsCardsProps {
		className?: string;
		classNames?: {
			card?: SettingsCardClassNames;
			cards?: string;
		};
		localization?: Partial<AuthLocalization>;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import DeleteAccountCard from './account/delete-account-card.svelte';
	import ChangePasswordCard from './security/change-password-card.svelte';
	import SessionsCard from './security/sessions-card.svelte';
	// TODO: Import these components when they are ported
	// import PasskeysCard from './passkey/passkeys-card.svelte';
	// import ProvidersCard from './providers/providers-card.svelte';
	// import TwoFactorCard from './two-factor/two-factor-card.svelte';

	interface Props extends SecuritySettingsCardsProps {}

	let { className, classNames, localization: propLocalization }: Props = $props();

	const {
		credentials,
		deleteUser,
		hooks: { useListAccounts },
		localization: contextLocalization,
		passkey,
		social,
		genericOAuth,
		twoFactor
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	// Use the useListAccounts hook to get account data
	const listAccountsResult = useListAccounts();
	const accounts = $derived(listAccountsResult.data);
	const accountsPending = $derived(listAccountsResult.isPending);
	// TODO: Uncomment when ProvidersCard is ported
	// const refetchAccounts = listAccountsResult.refetch;

	// Check if credentials are linked
	const credentialsLinked = $derived(
		accounts?.some((acc) => acc.providerId === 'credential')
	);
</script>

<div class={cn('flex w-full flex-col gap-4 md:gap-6', className, classNames?.cards)}>
	{#if credentials}
		<ChangePasswordCard
			{accounts}
			classNames={classNames?.card}
			isPending={accountsPending}
			localization={mergedLocalization}
			skipHook
		/>
	{/if}

	<!-- TODO: Uncomment when ProvidersCard is ported -->
	<!-- {#if social?.providers?.length || genericOAuth?.providers?.length}
		<ProvidersCard
			{accounts}
			classNames={classNames?.card}
			isPending={accountsPending}
			localization={mergedLocalization}
			refetch={refetchAccounts}
			skipHook
		/>
	{/if} -->

	<!-- TODO: Uncomment when TwoFactorCard is ported -->
	<!-- {#if twoFactor && credentialsLinked}
		<TwoFactorCard
			classNames={classNames?.card}
			localization={mergedLocalization}
		/>
	{/if} -->

	<!-- TODO: Uncomment when PasskeysCard is ported -->
	<!-- {#if passkey}
		<PasskeysCard
			classNames={classNames?.card}
			localization={mergedLocalization}
		/>
	{/if} -->

	<SessionsCard classNames={classNames?.card} localization={mergedLocalization} />

	{#if deleteUser}
		<DeleteAccountCard
			{accounts}
			classNames={classNames?.card}
			isPending={accountsPending}
			localization={mergedLocalization}
			skipHook
		/>
	{/if}
</div>
