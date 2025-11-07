<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { DropdownMenuContentProps } from '$lib/components/ui/dropdown-menu/index.js';
	import { Button, type ButtonSize } from '$lib/components/ui/button/index.js';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';
	import { getLocalizedError } from '$lib/utils/utils.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization, Profile } from '$lib/types/index.js';
	import type { Snippet } from 'svelte';
	import type { Organization } from 'better-auth/plugins/organization';
	import LogIn from '@lucide/svelte/icons/log-in';
	import Settings from '@lucide/svelte/icons/settings';
	import PlusCircle from '@lucide/svelte/icons/plus-circle';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import type { DropdownMenuTriggerProps } from 'bits-ui';
	import UserAvatar, { type UserAvatarClassNames } from '../user-avatar.svelte';
	import type { UserViewClassNames } from '../user-view.svelte';
	import OrganizationLogo from './organization-logo.svelte';
	import OrganizationCellView, {
		type OrganizationViewClassNames
	} from './organization-cell-view.svelte';
	import PersonalAccountView from './personal-account-view.svelte';
	import CreateOrganizationDialog from './create-organization-dialog.svelte';

	export interface OrganizationSwitcherClassNames {
		base?: string;
		skeleton?: string;
		trigger?: {
			base?: string;
			avatar?: UserAvatarClassNames;
			user?: UserViewClassNames;
			organization?: OrganizationViewClassNames;
			skeleton?: string;
		};
		content?: {
			base?: string;
			user?: UserViewClassNames;
			organization?: OrganizationViewClassNames;
			avatar?: UserAvatarClassNames;
			menuItem?: string;
			separator?: string;
		};
	}

	interface Props {
		class?: string;
		classNames?: OrganizationSwitcherClassNames;
		align?: DropdownMenuContentProps['align'];
		alignOffset?: DropdownMenuContentProps['alignOffset'];
		side?: DropdownMenuContentProps['side'];
		sideOffset?: DropdownMenuContentProps['sideOffset'];
		trigger?: Snippet<[{ props: DropdownMenuTriggerProps }]>;
		localization?: Partial<AuthLocalization>;
		slug?: string;
		onSetActive?: (organization: Organization | null) => void;
		size?: ButtonSize;
		/**
		 * Hide the personal organization option from the switcher.
		 * When true, users can only switch between organizations and cannot access their personal account.
		 * If no organization is active, the first available organization will be automatically selected.
		 * @default false
		 */
		hidePersonal?: boolean;
	}

	let {
		class: className,
		classNames,
		align,
		alignOffset,
		side,
		sideOffset,
		trigger,
		localization: propLocalization,
		slug: slugProp,
		size,
		onSetActive,
		hidePersonal = false,
		...restProps
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const {
		basePath,
		hooks: { useSession, useListOrganizations },
		account: accountOptions,
		organization: organizationOptions,
		redirectTo,
		navigate,
		toast,
		viewPaths,
		Link
	} = config;

	const { pathMode, slug: contextSlug, personalPath } = organizationOptions || {};

	const slug = slugProp || contextSlug;

	const contextLocalization = getLocalization();
	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let activeOrganizationPending = $state(false);
	let isCreateOrgDialogOpen = $state(false);
	let dropdownOpen = $state(false);

	const session = useSession();
	const sessionData = $derived($session.data);
	const sessionPending = $derived($session.isPending);
	const user = $derived(sessionData?.user as Profile | undefined);

	// Nanostores work directly with Svelte's $ syntax
	const organizationsStore = useListOrganizations() as ReturnType<typeof useListOrganizations> & {
		subscribe: Function;
	};
	const organizationsResult = $derived($organizationsStore);

	const organizations = $derived<Organization[] | null | undefined>(organizationsResult?.data);

	const organizationsPending = $derived<boolean>(
		organizationsResult?.isPending ? Boolean(organizationsResult.isPending) : false
	);

	const currentOrgResult = useCurrentOrganization({ slug });
	const activeOrganization = $derived(currentOrgResult.data);
	const organizationPending = $derived(currentOrgResult.isPending);
	const organizationRefetching = $derived(currentOrgResult.isRefetching);
	const organizationRefetch = currentOrgResult.refetch;

	// Smarter pending logic: Only show loading if we're truly waiting for data
	// If we have organizations list, we can show the UI even if active org is still loading
	const isPending = $derived(
		sessionPending ||
			activeOrganizationPending ||
			(organizationsPending && !organizations) || // Only pending if we don't have orgs yet
			(organizationPending && !organizations) // Only pending if we don't have orgs yet
	);

	// Reset active organization pending when refetching completes
	$effect(() => {
		if (!organizationRefetching) {
			activeOrganizationPending = false;
		}
	});

	async function switchOrganization(organization: Organization | null) {
		// Prevent switching to personal account when hidePersonal is true
		if (hidePersonal && organization === null) {
			return;
		}

		if (pathMode === 'slug') {
			if (organization) {
				navigate(`${organizationOptions?.basePath}/${organization.slug}`);
			} else {
				navigate(personalPath ?? redirectTo);
			}
			return;
		}

		activeOrganizationPending = true;

		try {
			onSetActive?.(organization);

			await authClient.organization.setActive({
				organizationId: organization?.id || null,
				fetchOptions: {
					throw: true
				}
			});

			organizationRefetch?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
			activeOrganizationPending = false;
		}
	}

	// Auto-select first organization when hidePersonal is true
	$effect(() => {
		if (
			hidePersonal &&
			!activeOrganization &&
			!activeOrganizationPending &&
			organizations &&
			organizations.length > 0 &&
			!sessionPending &&
			!organizationPending &&
			!slug
		) {
			switchOrganization(organizations[0]);
		}
	});

	function handleCloseAutoFocus(e: Event) {
		e.preventDefault();
	}
</script>

<DropdownMenu.Root bind:open={dropdownOpen}>
	<DropdownMenu.Trigger class={cn(size === 'icon' && 'rounded-full', classNames?.trigger?.base)}>
		{#snippet child({ props })}
			{#if trigger}
				{@render trigger({ props })}
			{:else if size === 'icon'}
				<Button
					{...props}
					size="icon"
					class={cn('size-fit rounded-full', className, classNames?.trigger?.base)}
					variant="ghost"
					type="button"
					{...restProps}
				>
					{#if isPending || activeOrganization || !sessionData || user?.isAnonymous || hidePersonal}
						<OrganizationLogo
							class={cn(className, classNames?.base)}
							classNames={classNames?.trigger?.avatar}
							{isPending}
							organization={activeOrganization}
							{localization}
						/>
					{:else}
						<UserAvatar
							class={cn(className, classNames?.base)}
							classNames={classNames?.trigger?.avatar}
							{user}
							{localization}
						/>
					{/if}
				</Button>
			{:else}
				<Button
					{...props}
					class={cn('h-fit p-2!', className, classNames?.trigger?.base)}
					{size}
					{...restProps}
				>
					{#if isPending || activeOrganization || !sessionData || user?.isAnonymous || hidePersonal}
						<OrganizationCellView
							classNames={classNames?.trigger?.organization}
							{isPending}
							{localization}
							organization={activeOrganization}
							size={size === 'icon-sm' || size === 'icon-lg' ? 'default' : size}
						/>
					{:else}
						<PersonalAccountView
							classNames={classNames?.trigger?.user}
							{localization}
							size={size === 'icon-sm' || size === 'icon-lg' ? 'default' : size}
							{user}
						/>
					{/if}

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
		<div class={cn('flex items-center justify-between gap-2 p-2', classNames?.content?.menuItem)}>
			{#if (user && !user.isAnonymous) || isPending}
				{#if activeOrganizationPending || activeOrganization || hidePersonal}
					<OrganizationCellView
						classNames={classNames?.content?.organization}
						isPending={isPending || activeOrganizationPending}
						organization={activeOrganization}
						{localization}
					/>
				{:else}
					<PersonalAccountView
						classNames={classNames?.content?.user}
						{isPending}
						{localization}
						{user}
					/>
				{/if}

				{#if !isPending}
					<Link
						href={activeOrganization
							? pathMode === 'slug'
								? `${organizationOptions?.basePath}/${activeOrganization.slug}/${organizationOptions?.viewPaths.SETTINGS}`
								: `${organizationOptions?.basePath}/${organizationOptions?.viewPaths.SETTINGS}`
							: `${accountOptions?.basePath}/${accountOptions?.viewPaths.SETTINGS}`}
					>
						<Button
							size="icon"
							variant="outline"
							class="ml-auto size-8!"
							onclick={() => (dropdownOpen = false)}
						>
							<Settings class="size-4" />
						</Button>
					</Link>
				{/if}
			{:else}
				<div class="-my-1 text-xs text-muted-foreground">
					{localization.ORGANIZATION}
				</div>
			{/if}
		</div>

		<DropdownMenu.Separator class={classNames?.content?.separator} />

		{#if activeOrganization && !hidePersonal}
			{#if pathMode === 'slug'}
				<Link href={personalPath ?? redirectTo}>
					<DropdownMenu.Item>
						<PersonalAccountView
							classNames={classNames?.content?.user}
							{isPending}
							{localization}
							{user}
						/>
					</DropdownMenu.Item>
				</Link>
			{:else}
				<DropdownMenu.Item onclick={() => switchOrganization(null)}>
					<PersonalAccountView
						classNames={classNames?.content?.user}
						{isPending}
						{localization}
						{user}
					/>
				</DropdownMenu.Item>
			{/if}
		{/if}

		{#each organizations ?? [] as organization (organization.id)}
			{#if organization.id !== activeOrganization?.id}
				{#if pathMode === 'slug'}
					<Link href={`${organizationOptions?.basePath}/${organization.slug}`}>
						<DropdownMenu.Item>
							<OrganizationCellView
								classNames={classNames?.content?.organization}
								{isPending}
								{localization}
								{organization}
							/>
						</DropdownMenu.Item>
					</Link>
				{:else}
					<DropdownMenu.Item onclick={() => switchOrganization(organization)}>
						<OrganizationCellView
							classNames={classNames?.content?.organization}
							{isPending}
							{localization}
							{organization}
						/>
					</DropdownMenu.Item>
				{/if}
			{/if}
		{/each}

		{#if organizations && organizations.length > 0 && (!hidePersonal || organizations.length > 1)}
			<DropdownMenu.Separator class={classNames?.content?.separator} />
		{/if}

		{#if !isPending && sessionData && !user?.isAnonymous}
			<DropdownMenu.Item
				class={cn(classNames?.content?.menuItem)}
				onclick={() => (isCreateOrgDialogOpen = true)}
			>
				<PlusCircle />
				{localization.CREATE_ORGANIZATION}
			</DropdownMenu.Item>
		{:else}
			<Link href={`${basePath}/${viewPaths.SIGN_IN}`}>
				<DropdownMenu.Item class={cn(classNames?.content?.menuItem)}>
					<LogIn />
					{localization.SIGN_IN}
				</DropdownMenu.Item>
			</Link>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<CreateOrganizationDialog bind:open={isCreateOrgDialogOpen} {localization} />
