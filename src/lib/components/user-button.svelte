<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { DropdownMenuContentProps } from '$lib/components/ui/dropdown-menu/index.js';
	import { Button, type ButtonSize } from '$lib/components/ui/button/index.js';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import UserAvatar, { type UserAvatarClassNames } from './user-avatar.svelte';
	import UserView, { type UserViewClassNames } from './user-view.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { getLocalizedError } from '$lib/utils/utils.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization, Profile } from '$lib/types/index.js';
	import type { Snippet } from 'svelte';
	import LogIn from '@lucide/svelte/icons/log-in';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import PlusCircle from '@lucide/svelte/icons/plus-circle';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
	import type { DropdownMenuTriggerProps } from 'bits-ui';

	export interface UserButtonClassNames {
		base?: string;
		skeleton?: string;
		trigger?: {
			base?: string;
			avatar?: UserAvatarClassNames;
			user?: UserViewClassNames;
			skeleton?: string;
		};
		content?: {
			base?: string;
			user?: UserViewClassNames;
			avatar?: UserAvatarClassNames;
			menuItem?: string;
			separator?: string;
		};
	}

	interface AdditionalLink {
		href: string;
		icon?: Snippet;
		label: string | Snippet;
		signedIn?: boolean;
		separator?: boolean;
	}

	interface Props {
		class?: string;
		classNames?: UserButtonClassNames;
		align?: DropdownMenuContentProps['align'];
		alignOffset?: DropdownMenuContentProps['alignOffset'];
		side?: DropdownMenuContentProps['side'];
		sideOffset?: DropdownMenuContentProps['sideOffset'];
		additionalLinks?: AdditionalLink[];
		trigger?: Snippet<[{ props: DropdownMenuTriggerProps }]>;
		disableDefaultLinks?: boolean;
		size?: ButtonSize;
		localization?: Partial<AuthLocalization>;
	}

	let {
		class: className,
		classNames,
		align,
		alignOffset,
		side,
		sideOffset,
		trigger,
		additionalLinks,
		disableDefaultLinks,
		size = 'icon',
		localization: propLocalization
	}: Props = $props();

	const config = getAuthUIConfig();
	const {
		basePath,
		hooks: { useSession, useListDeviceSessions },
		mutators: { setActiveSession },
		multiSession,
		account: accountOptions,
		signUp,
		toast,
		viewPaths,
		onSessionChange,
		Link
	} = config;

	const contextLocalization = getLocalization();
	const localization = { ...contextLocalization, ...propLocalization };

	// Check hydration state
	const isHydratedState = useIsHydrated();
	const isHydrated = $derived(isHydratedState.value);

	// Session state
	const session = useSession();
	const sessionData = $derived($session.data);
	const sessionPending = $derived($session.isPending);
	const user = $derived(sessionData?.user as Profile | undefined);

	// Device sessions for multi-session support
	const deviceSessionsResult =
		multiSession && useListDeviceSessions ? useListDeviceSessions() : null;
	const deviceSessions = $derived(deviceSessionsResult?.data ?? null);
	const deviceSessionsPending = $derived(deviceSessionsResult?.isPending ?? false);

	// Active session switching state
	let activeSessionPending = $state(false);

	// Overall pending state
	const isPending = $derived(sessionPending || activeSessionPending || !isHydrated);

	// Switch account handler
	async function switchAccount(sessionToken: string) {
		activeSessionPending = true;

		try {
			await setActiveSession({ sessionToken });
			await onSessionChange?.();
		} catch (error) {
			const errorMessage = getLocalizedError({ error, localization });
			toast(errorMessage);
			activeSessionPending = false;
		}
	}

	// Reset active session pending when session changes
	$effect(() => {
		if (multiSession && sessionData) {
			activeSessionPending = false;
		}
	});

	// Prevent auto-focus on close
	function handleCloseAutoFocus(e: Event) {
		e.preventDefault();
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={cn(size === 'icon' && 'rounded-full', classNames?.trigger?.base)}>
		{#snippet child({ props })}
			{#if trigger}
				{@render trigger({ props })}
			{:else if size === 'icon'}
				<Button size="icon" {...props} class="size-fit rounded-full" variant="ghost">
					<UserAvatar
						{isPending}
						class={cn(className, classNames?.base)}
						classNames={classNames?.trigger?.avatar}
						{user}
						{localization}
					/>
				</Button>
			{:else}
				<Button {...props} class={cn('h-fit p-2!', className, classNames?.trigger?.base)} {size}>
					<UserView
						size={size === 'icon-sm' || size === 'icon-lg' ? 'default' : size}
						user={!user?.isAnonymous ? user : null}
						{isPending}
						classNames={classNames?.trigger?.user}
						{localization}
					/>

					<ChevronsUpDown class="ml-auto" />
				</Button>
			{/if}
		{/snippet}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content
		class={cn(
			'w-[--bits-dropdown-menu-trigger-width] max-w-64 min-w-56',
			classNames?.content?.base
		)}
		{align}
		{alignOffset}
		{side}
		{sideOffset}
		onCloseAutoFocus={handleCloseAutoFocus}
	>
		<div class={cn('p-2', classNames?.content?.menuItem)}>
			{#if (user && !user.isAnonymous) || isPending}
				<UserView {user} {isPending} classNames={classNames?.content?.user} {localization} />
			{:else}
				<div class="-my-1 text-xs text-muted-foreground">
					{localization.ACCOUNT}
				</div>
			{/if}
		</div>

		<DropdownMenu.Separator class={classNames?.content?.separator} />

		{#if additionalLinks}
			{#each additionalLinks as { href, icon, label, signedIn, separator }, index (index)}
				{#if signedIn === undefined || (signedIn && !!sessionData) || (!signedIn && !sessionData)}
					<Link {href}>
						<DropdownMenu.Item class={classNames?.content?.menuItem}>
							{#if icon}
								{@render icon()}
							{/if}
							{#if typeof label === 'string'}
								{label}
							{:else}
								{@render label()}
							{/if}
						</DropdownMenu.Item>
					</Link>
					{#if separator}
						<DropdownMenu.Separator class={classNames?.content?.separator} />
					{/if}
				{/if}
			{/each}
		{/if}

		{#if !user || user.isAnonymous}
			<Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
				<DropdownMenu.Item class={classNames?.content?.menuItem}>
					<LogIn />
					{localization.SIGN_IN}
				</DropdownMenu.Item>
			</Link>

			{#if signUp}
				<Link href={`${basePath}/${viewPaths.SIGN_UP}`}>
					<DropdownMenu.Item class={classNames?.content?.menuItem}>
						<UserRoundPlus />
						{localization.SIGN_UP}
					</DropdownMenu.Item>
				</Link>
			{/if}
		{:else}
			{#if !disableDefaultLinks && accountOptions}
				<Link href={`${accountOptions.basePath}/${accountOptions.viewPaths?.SETTINGS}`}>
					<DropdownMenu.Item class={classNames?.content?.menuItem}>
						<Settings />
						{localization.SETTINGS}
					</DropdownMenu.Item>
				</Link>
			{/if}

			<Link href={`${basePath}/${viewPaths.SIGN_OUT}`}>
				<DropdownMenu.Item class={classNames?.content?.menuItem}>
					<LogOut />
					{localization.SIGN_OUT}
				</DropdownMenu.Item>
			</Link>
		{/if}

		{#if user && multiSession}
			<DropdownMenu.Separator class={classNames?.content?.separator} />

			{#if !deviceSessions && deviceSessionsPending}
				<DropdownMenu.Item disabled class={classNames?.content?.menuItem}>
					<UserView isPending={true} classNames={classNames?.content?.user} />
				</DropdownMenu.Item>

				<DropdownMenu.Separator class={classNames?.content?.separator} />
			{/if}

			{#if deviceSessions}
				{#each deviceSessions.filter((s) => s?.user?.id !== user?.id) ?? [] as deviceSessionData (deviceSessionData.session.id)}
					<DropdownMenu.Item
						class={classNames?.content?.menuItem}
						onclick={() => switchAccount(deviceSessionData.session.token)}
					>
						<UserView
							user={deviceSessionData.user as Profile}
							classNames={classNames?.content?.user}
						/>
					</DropdownMenu.Item>

					<DropdownMenu.Separator class={classNames?.content?.separator} />
				{/each}
			{/if}

			<Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
				<DropdownMenu.Item class={classNames?.content?.menuItem}>
					<PlusCircle />
					{localization.ADD_ACCOUNT}
				</DropdownMenu.Item>
			</Link>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
