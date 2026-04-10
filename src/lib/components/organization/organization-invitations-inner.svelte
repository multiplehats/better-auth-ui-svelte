<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import InvitationCell from './invitation-cell.svelte';
	import type { Organization } from 'better-auth/plugins/organization';

	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization: AuthLocalization;
		organization: Organization;
	}

	let { className, classNames, localization, organization }: Props = $props();

	const config = getAuthUIConfig();
	const { hooks } = config;

	// Hook called unconditionally at the top level — organization is guaranteed by the parent.
	const invitationsHook = hooks.useListInvitations({ query: { organizationId: organization.id } });
	const invitations = $derived(invitationsHook?.data);
	const pendingInvitations = $derived(
		invitations?.filter((invitation) => invitation.status === 'pending')
	);
</script>

{#if pendingInvitations?.length}
	<SettingsCard
		{className}
		{classNames}
		title={localization.PENDING_INVITATIONS}
		description={localization.PENDING_INVITATIONS_DESCRIPTION}
	>
		<CardContent class={cn('grid gap-4', classNames?.content)}>
			{#each pendingInvitations as invitation (invitation.id)}
				<InvitationCell {classNames} {invitation} {localization} {organization} />
			{/each}
		</CardContent>
	</SettingsCard>
{/if}
