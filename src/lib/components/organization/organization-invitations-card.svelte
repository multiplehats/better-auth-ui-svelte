<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import OrganizationInvitationsInner from './organization-invitations-inner.svelte';

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

	const { organization: organizationOptions } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const slug = slugProp || organizationOptions?.slug;

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
</script>

{#if organization}
	<OrganizationInvitationsInner {className} {classNames} {localization} {organization} />
{/if}
