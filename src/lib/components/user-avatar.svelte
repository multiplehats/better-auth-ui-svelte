<script lang="ts">
	import UserRound from '@lucide/svelte/icons/user-round';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { getGravatarUrl } from '$lib/utils/gravatar-utils.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { Profile } from '$lib/types/profile.js';

	export interface UserAvatarClassNames {
		base?: string;
		image?: string;
		fallback?: string;
		fallbackIcon?: string;
		skeleton?: string;
	}

	interface Props {
		user?: Profile | null;
		className?: string;
		classNames?: UserAvatarClassNames;
		size?: 'sm' | 'default' | 'lg' | 'xl' | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
	}

	let {
		user,
		className,
		classNames,
		size = 'default',
		isPending = false,
		localization: propLocalization,
		...restProps
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const gravatar = config.gravatar;
	const avatar = config.avatar;

	const localization = { ...contextLocalization, ...propLocalization };

	// Get user name from various possible fields
	const name = $derived(
		user?.displayName ||
			user?.name ||
			user?.fullName ||
			user?.firstName ||
			user?.displayUsername ||
			user?.username ||
			user?.email
	);

	// Get user image from various possible fields
	const userImage = $derived(user?.image || user?.avatar || user?.avatarUrl);

	// Calculate gravatar URL
	const gravatarUrl = $derived(
		gravatar && user?.email
			? getGravatarUrl(user.email, gravatar === true ? undefined : gravatar)
			: null
	);

	const src = $derived(gravatar ? gravatarUrl : userImage);

	// Size classes
	const sizeClass = $derived(
		size === 'sm' ? 'size-6' : size === 'lg' ? 'size-10' : size === 'xl' ? 'size-12' : 'size-8'
	);

	// Get first two characters for fallback
	function firstTwoCharacters(name?: string | null) {
		return name?.slice(0, 2);
	}
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
				alt={name || localization?.USER || 'User'}
				class={classNames?.image}
				src={src || ''}
			/>
		{:else}
			<Avatar.Image
				alt={name || localization?.USER || 'User'}
				class={classNames?.image}
				src={src || undefined}
			/>
		{/if}

		<Avatar.Fallback
			class={cn('text-foreground uppercase', classNames?.fallback)}
			delayMs={src ? 600 : undefined}
		>
			{#if firstTwoCharacters(name)}
				<span>{firstTwoCharacters(name)}</span>
			{:else}
				<UserRound class={cn('size-[50%]', classNames?.fallbackIcon)} />
			{/if}
		</Avatar.Fallback>
	</Avatar.Root>
{/if}
