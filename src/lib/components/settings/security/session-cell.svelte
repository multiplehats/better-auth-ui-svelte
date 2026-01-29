<script lang="ts">
	import type { Session } from 'better-auth';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { UAParser } from 'ua-parser-js';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	export interface SessionCellProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		session: Session;
		refetch?: Refetch;
	}

	type Props = SessionCellProps;

	let { className, classNames, localization: propLocalization, session, refetch }: Props = $props();

	const {
		basePath,
		hooks: { useSession },
		localization: contextLocalization,
		mutators: { revokeSession },
		viewPaths,
		navigate,
		toast
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const isCurrentSession = $derived(
		(() => {
			const currentSession = session;
			return currentSession.id === sessionData?.session?.id;
		})()
	);

	let isLoading = $state(false);

	const handleRevoke = async () => {
		isLoading = true;

		if (isCurrentSession) {
			navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
			return;
		}

		try {
			await revokeSession({ token: session.token });
			refetch?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));

			isLoading = false;
		}
	};

	const parser = UAParser(session.userAgent as string);
	const isMobile = parser.device.type === 'mobile';
</script>

<Card class={cn('flex-row items-center gap-3 px-4 py-3', className, classNames?.cell)}>
	{#if isMobile}
		<Smartphone class={cn('size-4', classNames?.icon)} />
	{:else}
		<Laptop class={cn('size-4', classNames?.icon)} />
	{/if}

	<div class="flex flex-col">
		<span class="text-sm font-semibold">
			{isCurrentSession ? mergedLocalization.CURRENT_SESSION : session?.ipAddress}
		</span>

		<span class="text-xs text-muted-foreground">
			{#if session.userAgent?.includes('tauri-plugin-http')}
				{mergedLocalization.APP}
			{:else if parser.os.name && parser.browser.name}
				{parser.os.name}, {parser.browser.name}
			{:else}
				{parser.os.name || parser.browser.name || session.userAgent || mergedLocalization.UNKNOWN}
			{/if}
		</span>
	</div>

	<Button
		class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
		disabled={isLoading}
		size="sm"
		variant="outline"
		onclick={handleRevoke}
	>
		{#if isLoading}
			<Loader2 class="animate-spin" />
		{/if}
		{isCurrentSession ? mergedLocalization.SIGN_OUT : mergedLocalization.REVOKE}
	</Button>
</Card>
