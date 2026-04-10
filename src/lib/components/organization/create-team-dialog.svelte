<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type { Organization } from 'better-auth/plugins/organization';
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
		organization: Organization;
		localization?: Partial<AuthLocalization>;
		onCreated?: () => void;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		organization,
		localization: propLocalization,
		onCreated
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
		defaultValues: { name: '' },
		onSubmit: async ({ value }) => {
			try {
				await // eslint-disable-next-line @typescript-eslint/no-explicit-any
				(authClient.organization as any).createTeam({
					name: value.name,
					organizationId: organization.id,
					fetchOptions: { throw: true }
				});

				toast.success(localization.CREATE_TEAM_SUCCESS);
				onCreated?.();
				handleOpenChange(false);
				form.reset();
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
				{localization.CREATE_TEAM}
			</Dialog.Title>
			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.CREATE_TEAM_DESCRIPTION}
			</Dialog.Description>
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
					{localization.CREATE_TEAM}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
