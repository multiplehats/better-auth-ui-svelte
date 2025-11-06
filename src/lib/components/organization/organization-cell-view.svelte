<script lang="ts">
	import { getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { Organization } from 'better-auth/plugins/organization';
	import { Skeleton } from '../ui/skeleton/index.js';
	import OrganizationLogo, { type OrganizationLogoClassNames } from './organization-logo.svelte';

	export interface OrganizationViewClassNames {
		base?: string;
		avatar?: OrganizationLogoClassNames;
		content?: string;
		title?: string;
		subtitle?: string;
		skeleton?: string;
	}

	interface Props {
		className?: string;
		classNames?: OrganizationViewClassNames;
		isPending?: boolean;
		size?: 'sm' | 'default' | 'lg' | null;
		organization?: Organization | null;
		localization?: Partial<AuthLocalization>;
	}

	let {
		className,
		classNames,
		isPending,
		size,
		organization,
		localization: propLocalization
	}: Props = $props();

	const contextLocalization = getLocalization();
	const localization = { ...contextLocalization, ...propLocalization };
</script>

<div class={cn('flex items-center gap-2 truncate', className, classNames?.base)}>
	<OrganizationLogo
		class={cn(size !== 'sm' && 'my-0.5')}
		classNames={classNames?.avatar}
		{isPending}
		{localization}
		{organization}
		{size}
	/>

	<div class={cn('flex flex-col truncate text-left leading-tight', classNames?.content)}>
		{#if isPending}
			<Skeleton
				class={cn(
					'max-w-full',
					size === 'lg' ? 'h-4.5 w-32' : 'h-3.5 w-24',
					classNames?.title,
					classNames?.skeleton
				)}
			/>

			{#if size !== 'sm'}
				<Skeleton
					class={cn(
						'mt-1.5 max-w-full',
						size === 'lg' ? 'h-3.5 w-24' : 'h-3 w-16',
						classNames?.subtitle,
						classNames?.skeleton
					)}
				/>
			{/if}
		{:else}
			<span
				class={cn(
					'truncate font-semibold',
					size === 'lg' ? 'text-base' : 'text-sm',
					classNames?.title
				)}
			>
				{organization?.name || localization?.ORGANIZATION}
			</span>

			{#if size !== 'sm' && organization?.slug}
				<span
					class={cn(
						'truncate opacity-70',
						size === 'lg' ? 'text-sm' : 'text-xs',
						classNames?.subtitle
					)}
				>
					{organization.slug}
				</span>
			{/if}
		{/if}
	</div>
</div>
