<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import OrganizationMembersInner from './organization-members-inner.svelte';

	export interface OrganizationMembersCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationMembersCardProps;

	let { className, classNames, localization: propLocalization, slug: slugProp }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { organization: organizationOptions } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// svelte-ignore state_referenced_locally -- slug prop initializes organization hook
	const slug = slugProp || organizationOptions?.slug;

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
</script>

{#if !organization}
	<SettingsCard
		{className}
		{classNames}
		title={localization.MEMBERS}
		description={localization.MEMBERS_DESCRIPTION}
		instructions={localization.MEMBERS_INSTRUCTIONS}
		actionLabel={localization.INVITE_MEMBER}
		isPending
	/>
{:else}
	<OrganizationMembersInner {className} {classNames} {localization} {organization} />
{/if}
