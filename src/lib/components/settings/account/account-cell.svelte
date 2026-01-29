<script lang="ts">
	import type { User, Session } from 'better-auth';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Repeat from '@lucide/svelte/icons/repeat';
	import UserX2 from '@lucide/svelte/icons/user-x';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import UserView from '$lib/components/user-view.svelte';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		class?: string;
		classNames?: SettingsCardClassNames;
		deviceSession: { user: User; session: Session };
		localization?: Partial<AuthLocalization>;
		refetch?: Refetch;
	}

	let { class: className, classNames, deviceSession, localization, refetch }: Props = $props();

	const {
		basePath,
		localization: contextLocalization,
		hooks: { useSession },
		mutators: { revokeDeviceSession, setActiveSession },
		toast,
		viewPaths,
		navigate
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...localization });

	const session = useSession();
	let isLoading = $state(false);

	const handleRevoke = async () => {
		isLoading = true;

		try {
			await revokeDeviceSession({
				sessionToken: deviceSession.session.token
			});

			refetch?.();
		} catch (error) {
			isLoading = false;

			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}
	};

	const handleSetActiveSession = async () => {
		isLoading = true;

		try {
			await setActiveSession({
				sessionToken: deviceSession.session.token
			});

			refetch?.();
		} catch (error) {
			toast.error(getLocalizedError({ error, localization: mergedLocalization }));
		}

		isLoading = false;
	};

	const isCurrentSession = $derived(deviceSession.session.id === $session.data?.session.id);
</script>

<Card class={cn('flex-row p-4', className, classNames?.cell)}>
	<UserView user={deviceSession.user} localization={mergedLocalization} />

	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
					disabled={isLoading}
					size="icon"
					type="button"
					variant="outline"
				>
					{#if isLoading}
						<Loader2 class="animate-spin" />
					{:else}
						<Ellipsis class={classNames?.icon} />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content>
			{#if !isCurrentSession}
				<DropdownMenu.Item onclick={handleSetActiveSession}>
					<Repeat class={classNames?.icon} />
					{mergedLocalization.SWITCH_ACCOUNT}
				</DropdownMenu.Item>
			{/if}

			<DropdownMenu.Item
				onclick={() => {
					if (isCurrentSession) {
						navigate(`${basePath}/${viewPaths.SIGN_OUT}`);
						return;
					}

					handleRevoke();
				}}
				variant="destructive"
			>
				{#if isCurrentSession}
					<LogOut class={classNames?.icon} />
				{:else}
					<UserX2 class={classNames?.icon} />
				{/if}

				{isCurrentSession ? mergedLocalization.SIGN_OUT : mergedLocalization.REVOKE}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</Card>
