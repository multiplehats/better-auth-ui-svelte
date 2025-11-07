<script lang="ts">
	import type { Account } from 'better-auth';
	import type { SocialProvider } from 'better-auth/social-providers';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import type { Provider } from '$lib/social-providers.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		account?: Account | null;
		isPending?: boolean;
		localization?: Partial<AuthLocalization>;
		other?: boolean;
		provider: Provider;
		refetch?: Refetch;
	}

	let {
		class: className,
		classNames,
		account,
		localization,
		other,
		provider,
		refetch
	}: Props = $props();

	const {
		authClient,
		basePath,
		baseURL,
		localization: contextLocalization,
		mutators: { unlinkAccount },
		viewPaths,
		toast
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...localization };

	let isLoading = $state(false);

	const handleLink = async () => {
		isLoading = true;
		const callbackURL = `${baseURL}${basePath}/${viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(window.location.pathname)}`;

		try {
			if (other) {
				await authClient.oauth2.link({
					providerId: provider.provider as SocialProvider,
					callbackURL,
					fetchOptions: { throw: true }
				});
			} else {
				await authClient.linkSocial({
					provider: provider.provider as SocialProvider,
					callbackURL,
					fetchOptions: { throw: true }
				});
			}
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));

			isLoading = false;
		}
	};

	const handleUnlink = async () => {
		isLoading = true;

		try {
			await unlinkAccount({
				accountId: account?.accountId,
				providerId: provider.provider
			});

			await refetch?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}

		isLoading = false;
	};
</script>

<Card class={cn('flex-row items-center gap-3 px-4 py-3', className, classNames?.cell)}>
	{#if provider.icon}
		{@const IconComponent = provider.icon}
		<IconComponent class={cn('size-4', classNames?.icon)} />
	{/if}

	<div class="flex-col">
		<div class="text-sm">{provider.name}</div>

		{#if account}
			{@render AccountInfo({ account, classNames })}
		{/if}
	</div>

	<Button
		class={cn('relative ms-auto', classNames?.button)}
		disabled={isLoading}
		size="sm"
		type="button"
		variant={account ? 'outline' : 'default'}
		onclick={account ? handleUnlink : handleLink}
	>
		{#if isLoading}
			<Loader2 class="animate-spin" />
		{/if}
		{account ? mergedLocalization.UNLINK : mergedLocalization.LINK}
	</Button>
</Card>

<!-- AccountInfo Component -->
{#snippet AccountInfo({ account, classNames }: { account: { accountId: string }; classNames?: SettingsCardClassNames })}
	{@const {
		hooks: { useAccountInfo }
	} = getAuthUIConfig()}
	{@const accountInfoQuery = useAccountInfo({ providerId: account.accountId })}

	{#if accountInfoQuery.isPending}
		<Skeleton class={cn('my-0.5 h-3 w-28', classNames?.skeleton)} />
	{:else if accountInfoQuery.data}
		<div class="text-muted-foreground text-xs">
			{accountInfoQuery.data.user.email}
		</div>
	{/if}
{/snippet}
