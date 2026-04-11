<script lang="ts" module>
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';

	export interface OrganizationSettingsCardsProps {
		className?: string;
		classNames?: {
			card?: SettingsCardClassNames;
			cards?: string;
		};
		localization?: Partial<AuthLocalization>;
		organizationId?: string;
		slug?: string;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import DeleteOrganizationCard from './delete-organization-card.svelte';
	import OrganizationLogoCard from './organization-logo-card.svelte';
	import OrganizationNameCard from './organization-name-card.svelte';
	import OrganizationSlugCard from './organization-slug-card.svelte';

	type Props = OrganizationSettingsCardsProps;

	let { className, classNames, localization, organizationId, slug }: Props = $props();

	const { organization: organizationOptions } = getAuthUIConfig();
</script>

<div class={cn('flex w-full flex-col gap-4 md:gap-6', className, classNames?.cards)}>
	{#if organizationOptions?.logo}
		<OrganizationLogoCard classNames={classNames?.card} {localization} {slug} {organizationId} />
	{/if}

	<OrganizationNameCard classNames={classNames?.card} {localization} {slug} {organizationId} />

	<OrganizationSlugCard classNames={classNames?.card} {localization} {slug} {organizationId} />

	<DeleteOrganizationCard classNames={classNames?.card} {localization} {slug} {organizationId} />
</div>
