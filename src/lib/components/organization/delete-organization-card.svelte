<script lang="ts">
	import { getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCard from '../settings/shared/settings-card.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import DeleteOrganizationForm from './delete-organization-form.svelte';

	export interface DeleteOrganizationCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = DeleteOrganizationCardProps;

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
		actionLabel={mergedLocalization.DELETE_ORGANIZATION}
		description={mergedLocalization.DELETE_ORGANIZATION_DESCRIPTION}
		{isPending}
		title={mergedLocalization.DELETE_ORGANIZATION}
		variant="destructive"
	/>
{:else}
	<DeleteOrganizationForm
		{className}
		{classNames}
		localization={mergedLocalization}
		{organization}
	/>
{/if}
