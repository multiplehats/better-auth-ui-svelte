<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getAuthClient, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import UserAvatar from './user-avatar.svelte';
	import { User, Settings, LogOut } from '@lucide/svelte';
	import { cn } from '$lib/utils/ui';

	interface Props {
		className?: string;
		align?: 'start' | 'center' | 'end';
	}

	let { className, align = 'end' }: Props = $props();

	const authClient = getAuthClient();
	const session = authClient.useSession();
	const loc = getLocalization();

	let open = $state(false);

	let user = $derived($session.data?.user);

	async function handleSignOut() {
		await authClient.signOut();
	}
</script>

{#if user}
	<DropdownMenu.Root bind:open>
		<DropdownMenu.Trigger class={cn('focus:outline-none', className)}>
			<UserAvatar {user} />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content {align} class="w-56">
			<DropdownMenu.Label>
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{user.name || 'User'}</p>
					<p class="text-xs text-muted-foreground leading-none">{user.email}</p>
				</div>
			</DropdownMenu.Label>

			<DropdownMenu.Separator />

			<DropdownMenu.Item href="/profile">
				<User class="mr-2 h-4 w-4" />
				<span>{loc.PROFILE}</span>
			</DropdownMenu.Item>

			<DropdownMenu.Item href="/settings">
				<Settings class="mr-2 h-4 w-4" />
				<span>{loc.SETTINGS}</span>
			</DropdownMenu.Item>

			<DropdownMenu.Separator />

			<DropdownMenu.Item onclick={handleSignOut}>
				<LogOut class="mr-2 h-4 w-4" />
				<span>{loc.SIGN_OUT}</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
