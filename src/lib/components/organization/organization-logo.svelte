<script lang="ts">
	import Building from '@lucide/svelte/icons/building';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { Organization } from 'better-auth/plugins/organization';

	export interface OrganizationLogoClassNames {
		base?: string;
		image?: string;
		fallback?: string;
		fallbackIcon?: string;
		skeleton?: string;
	}

	interface Props {
		organization?: Partial<Organization> | null;
		class?: string;
		classNames?: OrganizationLogoClassNames;
		size?: 'sm' | 'default' | 'lg' | 'xl' | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
	}

	let {
		organization,
		class: className,
		classNames,
		size = 'default',
		isPending = false,
		localization: propLocalization,
		...restProps
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const avatar = config.avatar;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const name = $derived(organization?.name);
	const src = $derived(organization?.logo);

	// Size classes
	const sizeClass = $derived(
		size === 'sm' ? 'size-6' : size === 'lg' ? 'size-10' : size === 'xl' ? 'size-12' : 'size-8'
	);
</script>

{#if isPending}
	<Skeleton
		class={cn(
			'shrink-0 rounded-full',
			sizeClass,
			className,
			classNames?.base,
			classNames?.skeleton
		)}
	/>
{:else}
	<Avatar.Root class={cn('bg-muted', sizeClass, className, classNames?.base)} {...restProps}>
		{#if avatar?.Image}
			<avatar.Image
				alt={name || localization?.ORGANIZATION || 'Organization'}
				class={classNames?.image}
				src={src || ''}
			/>
		{:else}
			<Avatar.Image
				alt={name || localization?.ORGANIZATION || 'Organization'}
				class={classNames?.image}
				src={src || undefined}
			/>
		{/if}

		<Avatar.Fallback class={cn('text-foreground', classNames?.fallback)}>
			<Building class={cn('size-[50%]', classNames?.fallbackIcon)} />
		</Avatar.Fallback>
	</Avatar.Root>
{/if}
