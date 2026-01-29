<script lang="ts">
	import { getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization, Profile } from '$lib/types/index.js';
	import { Skeleton } from '../ui/skeleton/index.js';
	import UserAvatar, { type UserAvatarClassNames } from '../user-avatar.svelte';

	export interface UserViewClassNames {
		base?: string;
		avatar?: UserAvatarClassNames;
		content?: string;
		title?: string;
		subtitle?: string;
		skeleton?: string;
	}

	interface Props {
		className?: string;
		classNames?: UserViewClassNames;
		isPending?: boolean;
		size?: 'sm' | 'default' | 'lg' | null;
		user?: Profile | null;
		localization?: Partial<AuthLocalization>;
	}

	let {
		className,
		classNames,
		isPending,
		size,
		user,
		localization: propLocalization
	}: Props = $props();

	const contextLocalization = getLocalization();
	const localization = $derived({ ...contextLocalization, ...propLocalization });
</script>

<div class={cn('flex items-center gap-2', className, classNames?.base)}>
	<UserAvatar
		class={cn(size !== 'sm' && 'my-0.5')}
		classNames={classNames?.avatar}
		{isPending}
		{localization}
		{size}
		{user}
	/>

	<div class={cn('grid flex-1 text-left leading-tight', classNames?.content)}>
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
						size === 'lg' ? 'h-3.5 w-40' : 'h-3 w-32',
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
				{user?.displayName ||
					user?.name ||
					user?.fullName ||
					user?.firstName ||
					user?.displayUsername ||
					user?.username ||
					user?.email ||
					localization?.USER}
			</span>

			{#if size !== 'sm'}
				<span
					class={cn(
						'truncate opacity-70',
						size === 'lg' ? 'text-sm' : 'text-xs',
						classNames?.subtitle
					)}
				>
					{localization?.PERSONAL_ACCOUNT}
				</span>
			{/if}
		{/if}
	</div>
</div>
