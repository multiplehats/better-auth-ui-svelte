<script lang="ts">
	/* eslint-disable svelte/no-unused-props */
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import {
		getAuthClient,
		getAuthUIConfig,
		getLocalization
	} from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		team: { id: string; name: string; organizationId: string };
		localization?: Partial<AuthLocalization>;
		onUpdated?: () => void;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		team,
		localization: propLocalization,
		onUpdated
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { toast } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	const formSchema = $derived(
		z.object({
			name: z.string().min(1, { message: `${localization.TEAM_NAME} ${localization.IS_REQUIRED}` })
		})
	);

	const form = createForm(() => ({
		defaultValues: { name: team.name },
		onSubmit: async ({ value }) => {
			try {
				await // eslint-disable-next-line @typescript-eslint/no-explicit-any
				(authClient.organization as any).updateTeam({
					teamId: team.id,
					data: { name: value.name },
					fetchOptions: { throw: true }
				});

				toast.success(localization.RENAME_TEAM_SUCCESS);
				onUpdated?.();
				handleOpenChange(false);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.RENAME_TEAM}
			</Dialog.Title>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="space-y-6"
		>
			<form.Field name="name" validators={{ onChange: formSchema.shape.name }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for="team-name" class={classNames?.label}>
							{localization.TEAM_NAME}
						</Label>
						<Input
							id="team-name"
							placeholder={localization.TEAM_NAME_PLACEHOLDER}
							value={field.state.value}
							oninput={(e) => field.handleChange(e.currentTarget.value)}
							onblur={field.handleBlur}
							disabled={isSubmitting}
							class={classNames?.input}
						/>
						{#if field.state.meta.errors.length > 0}
							<p class="mt-2 text-sm font-medium text-destructive">
								{getFieldError(field.state.meta.errors[0])}
							</p>
						{/if}
					</div>
				{/snippet}
			</form.Field>

			<Dialog.Footer class={classNames?.dialog?.footer}>
				<Button
					type="button"
					variant="outline"
					onclick={() => handleOpenChange(false)}
					class={cn(classNames?.button, classNames?.outlineButton)}
					disabled={isSubmitting}
				>
					{localization.CANCEL}
				</Button>
				<Button
					type="submit"
					class={cn(classNames?.button, classNames?.primaryButton)}
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<Loader2 class="animate-spin" />
					{/if}
					{localization.RENAME_TEAM}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
