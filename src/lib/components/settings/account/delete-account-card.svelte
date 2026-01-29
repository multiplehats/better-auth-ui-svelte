<script lang="ts">
	import type { Account } from 'better-auth';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCard from '../shared/settings-card.svelte';
	import DeleteAccountDialog from './delete-account-dialog.svelte';

	export interface DeleteAccountCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		accounts?: Account[] | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
		skipHook?: boolean;
	}

	type Props = DeleteAccountCardProps;

	let {
		className,
		classNames,
		accounts,
		isPending,
		localization: propLocalization,
		skipHook
	}: Props = $props();

	const {
		hooks: { useListAccounts },
		localization: contextLocalization
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	let showDialog = $state(false);

	// Use hook if skipHook is false
	let listAccountsResult: ReturnType<typeof useListAccounts> | undefined = undefined;
	// svelte-ignore state_referenced_locally -- skipHook is checked once at initialization to determine data source
	if (!skipHook) {
		listAccountsResult = useListAccounts();
	}

	// Derive accounts and isPending from hook if needed
	const derivedAccounts = $derived(skipHook ? accounts : listAccountsResult?.data);
	const derivedIsPending = $derived(skipHook ? isPending : listAccountsResult?.isPending);
</script>

<div>
	<SettingsCard
		{className}
		{classNames}
		actionLabel={mergedLocalization.DELETE_ACCOUNT}
		description={mergedLocalization.DELETE_ACCOUNT_DESCRIPTION}
		isPending={derivedIsPending}
		title={mergedLocalization.DELETE_ACCOUNT}
		variant="destructive"
		action={() => (showDialog = true)}
	/>

	<DeleteAccountDialog
		{classNames}
		accounts={derivedAccounts}
		localization={mergedLocalization}
		open={showDialog}
		onOpenChange={(open) => (showDialog = open)}
	/>
</div>
