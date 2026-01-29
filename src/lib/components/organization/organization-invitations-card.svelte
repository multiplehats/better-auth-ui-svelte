<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import InvitationCell from './invitation-cell.svelte';

	export interface OrganizationInvitationsCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationInvitationsCardProps;

	let { className, classNames, localization: propLocalization, slug: slugProp }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions, hooks } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// svelte-ignore state_referenced_locally -- slug prop initializes organization hook
	const slug = slugProp || organizationOptions?.slug;

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);

	// Only call the hook when we have an organization
	const invitationsHook = $derived(
		organization ? hooks.useListInvitations({ query: { organizationId: organization.id } }) : null
	);
	const invitations = $derived(invitationsHook?.data);
	const pendingInvitations = $derived(
		invitations?.filter((invitation) => invitation.status === 'pending')
	);
</script>

{#if organization && pendingInvitations?.length}
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
