<script lang="ts">
	import { getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import SettingsCardFooter from '../settings/shared/settings-card-footer.svelte';
	import SettingsCardHeader from '../settings/shared/settings-card-header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import OrganizationLogo from './organization-logo.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { cn } from '$lib/utils/utils.js';
	import OrganizationLogoForm from './organization-logo-form.svelte';

	export interface OrganizationLogoCardProps {
		class?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		slug?: string;
	}

	type Props = OrganizationLogoCardProps;

	let {
		class: className,
		classNames,
		localization: propLocalization,
		slug,
		...restProps
	}: Props = $props();

	const contextLocalization = getLocalization();
	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const currentOrg = useCurrentOrganization({ slug });
	const organization = $derived(currentOrg.data);
	const isPending = $derived(currentOrg.isPending);
</script>

{#if !organization}
	<Card.Root class={cn('w-full pb-0 text-start', className, classNames?.base)} {...restProps}>
		<div class="flex justify-between">
			<SettingsCardHeader
				className="grow self-start"
				title={mergedLocalization.LOGO}
				description={mergedLocalization.LOGO_DESCRIPTION}
				{isPending}
				{classNames}
			/>

			<Button type="button" class="me-6 size-fit rounded-full" size="icon" variant="ghost" disabled>
				<OrganizationLogo
					{isPending}
					class="size-20 text-2xl"
					classNames={classNames?.avatar}
					localization={mergedLocalization}
				/>
			</Button>
		</div>

		<SettingsCardFooter
			className="py-5!"
			instructions={mergedLocalization.LOGO_INSTRUCTIONS}
			{classNames}
			{isPending}
		/>
	</Card.Root>
{:else}
	<OrganizationLogoForm
		class={className}
		{classNames}
		localization={mergedLocalization}
		{organization}
		{...restProps}
	/>
{/if}
