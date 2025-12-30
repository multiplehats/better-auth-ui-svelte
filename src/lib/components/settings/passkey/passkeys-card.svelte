<script lang="ts">
	import { createForm } from '@tanstack/svelte-form';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import SessionFreshnessDialog from '../shared/session-freshness-dialog.svelte';
	import SettingsCard, { type SettingsCardClassNames } from '../shared/settings-card.svelte';
	import PasskeyCell from './passkey-cell.svelte';

	export interface PasskeysCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	type Props = PasskeysCardProps;

	let { className, classNames, localization: propLocalization, ...restProps }: Props = $props();

	const {
		authClient,
		freshAge,
		hooks: { useListPasskeys, useSession },
		localization: contextLocalization,
		toast
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const listPasskeysAtom = useListPasskeys();
	// useListPasskeys returns an atom that we need to dereference with $
	// The type is Partial, so we need to handle the case where the atom might not exist
	let passkeys = $state<Array<{ id: string; name?: string; createdAt: string }> | null | undefined>(
		undefined
	);
	let isPending = $state<boolean | undefined>(undefined);
	let refetch = $state<(() => void) | undefined>(undefined);

	$effect(() => {
		if (
			listPasskeysAtom &&
			typeof listPasskeysAtom === 'object' &&
			'subscribe' in listPasskeysAtom
		) {
			const value = $listPasskeysAtom;
			passkeys = value?.data;
			isPending = value?.isPending;
			refetch = value?.refetch;
		}
	});

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const session = $derived(sessionData?.session);
	const isFresh = $derived(
		session ? Date.now() - new Date(session.createdAt).getTime() < freshAge * 1000 : false
	);

	let showFreshnessDialog = $state(false);

	const addPasskey = async () => {
		// If session isn't fresh, show the freshness dialog
		if (!isFresh) {
			showFreshnessDialog = true;
			return;
		}

		try {
			await authClient.passkey.addPasskey({
				fetchOptions: { throw: true }
			});
			await refetch?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}
	};

	const form = createForm(() => ({
		onSubmit: async () => {
			await addPasskey();
		}
	}));
</script>

<SessionFreshnessDialog
	open={showFreshnessDialog}
	onOpenChange={(open) => (showFreshnessDialog = open)}
	{classNames}
	localization={mergedLocalization}
/>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<SettingsCard
		{className}
		{classNames}
		actionLabel={mergedLocalization.ADD_PASSKEY}
		description={mergedLocalization.PASSKEYS_DESCRIPTION}
		instructions={mergedLocalization.PASSKEYS_INSTRUCTIONS}
		{isPending}
		title={mergedLocalization.PASSKEYS}
		{...restProps}
	>
		{#if passkeys && passkeys.length > 0}
			<CardContent class={cn('grid gap-4', classNames?.content)}>
				{#each passkeys as passkey (passkey.id)}
					<PasskeyCell {classNames} localization={mergedLocalization} {passkey} {refetch} />
				{/each}
			</CardContent>
		{/if}
	</SettingsCard>
</form>
