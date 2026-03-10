<script lang="ts">
	import { useAuthenticate } from '$lib/hooks/use-authenticate.svelte.js';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { cn, getSearchParam } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import OrganizationCellView from './organization-cell-view.svelte';
	import AcceptInvitationInner from './accept-invitation-inner.svelte';
	import { browser } from '$app/environment';

	export type AcceptInvitationCardClassNames = SettingsCardClassNames;

	interface Props {
		class?: string;
		classNames?: AcceptInvitationCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	let { class: className, classNames, localization: propLocalization }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const { redirectTo, replace, toast } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionData = useAuthenticate();
	let invitationId = $state<string | null>(null);

	// Get invitation ID from URL params
	$effect(() => {
		if (!browser) return;

		const invitationIdParam = getSearchParam('invitationId');

		if (!invitationIdParam) {
			toast.error(localization.INVITATION_NOT_FOUND);
			replace(redirectTo);
			return;
		}

		invitationId = invitationIdParam;
	});
</script>

{#if !sessionData.data || !invitationId}
	<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
		<Card.Header class={cn('justify-items-center', classNames?.header)}>
			<Skeleton class={cn('my-1 h-5 w-full max-w-32 md:h-5.5 md:w-40', classNames?.skeleton)} />
			<Skeleton class={cn('my-0.5 h-3 w-full max-w-56 md:h-3.5 md:w-64', classNames?.skeleton)} />
		</Card.Header>

		<Card.Content class={cn('flex flex-col gap-6 truncate', classNames?.content)}>
			<Card.Root class={cn('flex-row items-center p-4')}>
				<OrganizationCellView isPending {localization} />
				<Skeleton class="mt-0.5 ml-auto h-4 w-full max-w-14 shrink-2" />
			</Card.Root>

			<div class="grid grid-cols-2 gap-3">
				<Skeleton class="h-9 w-full" />
				<Skeleton class="h-9 w-full" />
			</div>
		</Card.Content>
	</Card.Root>
{:else}
	<AcceptInvitationInner class={className} {classNames} {localization} {invitationId} />
{/if}
