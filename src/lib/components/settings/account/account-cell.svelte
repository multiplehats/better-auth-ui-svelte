<script lang="ts">
	import type { User, Session } from 'better-auth';
	import { Ellipsis, Loader2, LogOut, Repeat, UserX2 } from 'lucide-svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, Refetch } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
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

	const mergedLocalization = { ...contextLocalization, ...localization };

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

	<DropdownMenu>
		<DropdownMenuTrigger>
			{#snippet child(props)}
				<Button
					class={cn('relative ms-auto', classNames?.button, classNames?.outlineButton)}
					disabled={isLoading}
					size="icon"
					type="button"
					variant="outline"
					{...props}
				>
					{#if isLoading}
						<Loader2 class="animate-spin" />
					{:else}
						<Ellipsis class={classNames?.icon} />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenuTrigger>

		<DropdownMenuContent>
			{#if !isCurrentSession}
				<DropdownMenuItem onclick={handleSetActiveSession}>
					<Repeat class={classNames?.icon} />
					{mergedLocalization.SWITCH_ACCOUNT}
				</DropdownMenuItem>
			{/if}

			<DropdownMenuItem
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
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</Card>
