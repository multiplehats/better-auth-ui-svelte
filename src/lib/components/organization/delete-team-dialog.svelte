<script lang="ts">
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	interface Props {
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
		team: { id: string; name: string; organizationId: string };
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		onDeleted?: () => void;
	}

	let {
		classNames,
		localization: propLocalization,
		team,
		open = $bindable(false),
		onOpenChange,
		onDeleted
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { toast } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	let isDeleting = $state(false);

	async function deleteTeam() {
		isDeleting = true;
		try {
			await // eslint-disable-next-line @typescript-eslint/no-explicit-any
			(authClient.organization as any).removeTeam({
				teamId: team.id,
				organizationId: team.organizationId,
				fetchOptions: { throw: true }
			});

			toast.success(localization.DELETE_TEAM_SUCCESS);
			onDeleted?.();
			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}
		isDeleting = false;
	}

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.DELETE_TEAM}
			</Dialog.Title>
			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.DELETE_TEAM_CONFIRM}
			</Dialog.Description>
		</Dialog.Header>

		<div class={cn('rounded-md border p-4 text-sm font-medium', classNames?.cell)}>
			{team.name}
		</div>

		<Dialog.Footer class={classNames?.dialog?.footer}>
			<Button
				type="button"
				variant="outline"
				onclick={() => handleOpenChange(false)}
				class={cn(classNames?.button, classNames?.outlineButton)}
				disabled={isDeleting}
			>
				{localization.CANCEL}
			</Button>
			<Button
				type="button"
				variant="destructive"
				onclick={deleteTeam}
				class={cn(classNames?.button, classNames?.destructiveButton)}
				disabled={isDeleting}
			>
				{#if isDeleting}
					<Loader2 class="animate-spin" />
				{/if}
				{localization.DELETE_TEAM}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
