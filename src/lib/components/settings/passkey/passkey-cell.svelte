<script lang="ts">
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import SessionFreshnessDialog from '../shared/session-freshness-dialog.svelte';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	export interface PasskeyCellProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		passkey: { id: string; createdAt: Date };
		refetch?: Refetch;
	}

	interface Props extends PasskeyCellProps {}

	let {
		className,
		classNames,
		localization: propLocalization,
		passkey,
		refetch
	}: Props = $props();

	const {
		freshAge,
		hooks: { useSession },
		localization: contextLocalization,
		mutators: { deletePasskey },
		toast
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const session = $derived(sessionData?.session);
	const isFresh = $derived(
		session ? Date.now() - new Date(session.createdAt).getTime() < freshAge * 1000 : false
	);

	let showFreshnessDialog = $state(false);
	let isLoading = $state(false);

	const handleDeletePasskey = async () => {
		// If session isn't fresh, show the freshness dialog
		if (!isFresh) {
			showFreshnessDialog = true;
			return;
		}

		isLoading = true;

		try {
			await deletePasskey({ id: passkey.id });
			refetch?.();
		} catch (error) {
			isLoading = false;

			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}
	};
</script>

<SessionFreshnessDialog
	open={showFreshnessDialog}
	onOpenChange={(open) => (showFreshnessDialog = open)}
	{classNames}
	localization={mergedLocalization}
/>

<Card class={cn('flex-row items-center p-4', className, classNames?.cell)}>
	<div class="flex items-center gap-3">
		<Fingerprint class={cn('size-4', classNames?.icon)} />
		<span class="text-sm">
			{new Date(passkey.createdAt).toLocaleString()}
		</span>
	</div>

	<Button
		class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
		disabled={isLoading}
		size="sm"
		variant="outline"
		onclick={handleDeletePasskey}
	>
		{#if isLoading}
			<Loader2 class="animate-spin" />
		{/if}

		{mergedLocalization.DELETE}
	</Button>
</Card>
