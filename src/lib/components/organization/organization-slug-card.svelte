<script lang="ts">
	import { getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import OrganizationSlugForm from './organization-slug-form.svelte';

	export interface OrganizationSlugCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationSlugCardProps;

	let { className, classNames, localization: propLocalization, slug }: Props = $props();

	const contextLocalization = getLocalization();
	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
	const isPending = $derived(currentOrg.isPending);
</script>

{#if !organization}
	<SettingsCard
		{className}
		{classNames}
		description={mergedLocalization.ORGANIZATION_SLUG_DESCRIPTION}
		instructions={mergedLocalization.ORGANIZATION_SLUG_INSTRUCTIONS}
		{isPending}
		title={mergedLocalization.ORGANIZATION_SLUG}
		actionLabel={mergedLocalization.SAVE}
	>
		<CardContent class={classNames?.content}>
			<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
		</CardContent>
	</SettingsCard>
{:else}
	<OrganizationSlugForm {className} {classNames} localization={mergedLocalization} {organization} />
{/if}
