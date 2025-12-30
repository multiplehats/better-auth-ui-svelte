<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import SettingsCard, {
		type SettingsCardClassNames
	} from '../settings/shared/settings-card.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import OrganizationNameForm from './organization-name-form.svelte';

	export interface OrganizationNameCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationNameCardProps;

	let {
		className,
		classNames,
		localization: propLocalization,
		slug,
		...restProps
	}: Props = $props();

	const { localization: contextLocalization } = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
</script>

{#if !organization}
	<SettingsCard
		{className}
		{classNames}
		actionLabel={mergedLocalization.SAVE}
		description={mergedLocalization.ORGANIZATION_NAME_DESCRIPTION}
		instructions={mergedLocalization.ORGANIZATION_NAME_INSTRUCTIONS}
		isPending={true}
		title={mergedLocalization.ORGANIZATION_NAME}
		{...restProps}
	>
		<CardContent class={classNames?.content}>
			<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
		</CardContent>
	</SettingsCard>
{:else}
	<OrganizationNameForm
		{className}
		{classNames}
		localization={mergedLocalization}
		{organization}
		{...restProps}
	/>
{/if}
