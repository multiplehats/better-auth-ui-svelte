<script lang="ts" module>
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';

	export interface UserInvitationsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { fromStore } from '$lib/utils/store-to-rune.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import UserInvitationRow from './user-invitation-row.svelte';

	type Props = UserInvitationsCardProps;

	let { className, classNames, localization: propLocalization }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const {
		hooks: { useListUserInvitations, useListOrganizations }
	} = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// useListUserInvitations returns AuthHook (plain object), not a store
	const invitationsHook = useListUserInvitations();
	const invitations = $derived(invitationsHook?.data);
	const refetchInvitations = invitationsHook?.refetch;

	// useListOrganizations returns a store, so we need fromStore
	const organizationsStore = useListOrganizations();
	const organizationsResult = fromStore(organizationsStore);
	const refetchOrganizations = $derived(organizationsResult.value?.refetch);

	const pendingInvitations = $derived(
		invitations?.filter((invitation) => invitation.status === 'pending')
	);

	async function handleRefresh() {
		await refetchInvitations?.();
		refetchOrganizations?.();
	}
</script>

{#if pendingInvitations?.length}
	<SettingsCard
		{className}
		{classNames}
		title={localization.PENDING_INVITATIONS}
		description={localization.PENDING_USER_INVITATIONS_DESCRIPTION ||
			localization.PENDING_INVITATIONS_DESCRIPTION}
	>
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#each pendingInvitations as invitation (invitation.id)}
				<UserInvitationRow {classNames} {invitation} {localization} onChanged={handleRefresh} />
			{/each}
		</CardContent>
	</SettingsCard>
{/if}
