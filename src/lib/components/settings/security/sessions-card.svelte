<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import SettingsCard, {
		type SettingsCardClassNames
	} from '../shared/settings-card.svelte';
	import { SettingsCellSkeleton } from '../skeletons/index.js';
	import SessionCell from './session-cell.svelte';

	export interface SessionsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	interface Props extends SessionsCardProps {}

	let {
		className,
		classNames,
		localization: propLocalization,
		...restProps
	}: Props = $props();

	const {
		hooks: { useListSessions },
		localization: contextLocalization
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const listSessions = useListSessions();
	const sessions = $derived(listSessions.data);
	const isPending = $derived(listSessions.isPending);
</script>

<SettingsCard
	{className}
	{classNames}
	description={mergedLocalization.SESSIONS_DESCRIPTION}
	{isPending}
	title={mergedLocalization.SESSIONS}
	{...restProps}
>
	<CardContent class={cn('grid gap-4', classNames?.content)}>
		{#if isPending}
			<SettingsCellSkeleton {classNames} />
		{:else if sessions}
			{#each sessions as session (session.id)}
				<SessionCell
					{classNames}
					localization={mergedLocalization}
					{session}
					refetch={listSessions.refetch}
				/>
			{/each}
		{/if}
	</CardContent>
</SettingsCard>
