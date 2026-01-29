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
	import { useLang } from '$lib/hooks/use-lang.svelte.js';
	import { cn, getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '$lib/components/settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import OrganizationCellView from '$lib/components/organization/organization-cell-view.svelte';
	import PersonalAccountView from '$lib/components/organization/personal-account-view.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		localization?: Partial<AuthLocalization>;
		onSuccess: (key: string) => void;
		refetch?: import('$lib/types/refetch.js').Refetch;
		organizationId?: string;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		localization: propLocalization,
		onSuccess,
		refetch,
		organizationId
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { hooks, toast, apiKey, organization: contextOrganization } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// Use the lang hook
	const { lang } = useLang();

	// Get current user from session - must be at top level
	const sessionStore = hooks.useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const user = $derived(sessionData?.user);

	// Fetch organizations if organization plugin is available - must be at top level
	const organizationsStore = contextOrganization ? hooks.useListOrganizations() : null;
	const organizations = $derived(
		organizationsStore && 'data' in organizationsStore
			? (organizationsStore.data as Organization[] | null | undefined)
			: undefined
	);

	const showOrganizationSelect = $derived(contextOrganization?.apiKey);

	// Form validation schema
	const formSchema = $derived(
		z.object({
			name: z.string().min(1, `${localization.NAME} ${localization.IS_REQUIRED}`),
			expiresInDays: z.string().optional(),
			organizationId: showOrganizationSelect
				? z.string().min(1, `${localization.ORGANIZATION} ${localization.IS_REQUIRED}`)
				: z.string().optional()
		})
	);

	// Track selected values for Select components
	let selectedExpiresInDays = $state('none');
	const initialOrganizationId = $derived(organizationId ?? 'personal');
	let selectedOrganizationId = $state(initialOrganizationId);

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			name: '',
			expiresInDays: 'none',
			organizationId: initialOrganizationId
		},
		onSubmit: async ({ value }) => {
			try {
				const expiresIn =
					value.expiresInDays && value.expiresInDays !== 'none'
						? Number.parseInt(value.expiresInDays) * 60 * 60 * 24
						: undefined;

				const selectedOrgId =
					value.organizationId === 'personal' ? undefined : value.organizationId;

				const metadata = {
					...(typeof apiKey === 'object' ? apiKey.metadata : {}),
					...(contextOrganization && selectedOrgId ? { organizationId: selectedOrgId } : {})
				};

				const result = await authClient.apiKey.create({
					name: value.name,
					expiresIn,
					prefix: typeof apiKey === 'object' ? apiKey.prefix : undefined,
					metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
					fetchOptions: { throw: true }
				});

				await refetch?.();
				onSuccess(result.key);
				handleOpenChange(false);
				form.reset();
				selectedExpiresInDays = 'none';
				selectedOrganizationId = initialOrganizationId;
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);

		// Reset form when dialog closes
		if (!newOpen) {
			form.reset();
			selectedExpiresInDays = 'none';
			selectedOrganizationId = initialOrganizationId;
		}
	}

	// Create relative time formatter
	const rtf = $derived(new Intl.RelativeTimeFormat(lang ?? 'en'));

	// Expiration options
	const expirationDays = [1, 7, 30, 60, 90, 180, 365];
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={classNames?.dialog?.content} onOpenAutoFocus={(e) => e.preventDefault()}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.CREATE_API_KEY}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.CREATE_API_KEY_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="space-y-6"
		>
			{#if showOrganizationSelect}
				<form.Field name="organizationId">
					{#snippet children(field)}
						<div class="space-y-2">
							<Label for="organizationId" class={classNames?.label}>
								{localization.ORGANIZATION}
							</Label>

							<Select.Root
								type="single"
								value={selectedOrganizationId}
								onValueChange={(value?: string) => {
									if (value) {
										selectedOrganizationId = value;
										field.handleChange(value);
									}
								}}
								disabled={isSubmitting}
							>
								<Select.Trigger id="organizationId" class={cn('w-full p-2', classNames?.input)}>
									{#if selectedOrganizationId === 'personal'}
										<PersonalAccountView {user} {localization} size="sm" />
									{:else}
										{@const org = organizations?.find((o) => o.id === selectedOrganizationId)}
										{#if org}
											<OrganizationCellView organization={org} {localization} size="sm" />
										{/if}
									{/if}
								</Select.Trigger>

								<Select.Content class="w-[--radix-select-trigger-width]">
									<Select.Item value="personal">
										<PersonalAccountView {user} {localization} size="sm" />
									</Select.Item>

									{#if organizations}
										{#each organizations as org (org.id)}
											<Select.Item value={org.id}>
												<OrganizationCellView organization={org} {localization} size="sm" />
											</Select.Item>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>

							{#if field.state.meta.errors.length > 0}
								<p class="text-sm font-medium text-destructive">
									{getFieldError(field.state.meta.errors[0])}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
			{/if}

			<div class="flex gap-4">
				<form.Field name="name" validators={{ onChange: formSchema.shape.name }}>
					{#snippet children(field)}
						<div class="flex-1 space-y-2">
							<Label for="name" class={classNames?.label}>
								{localization.NAME}
							</Label>

							<Input
								id="name"
								placeholder={localization.API_KEY_NAME_PLACEHOLDER}
								autofocus
								value={field.state.value}
								oninput={(e) => field.handleChange(e.currentTarget.value)}
								onblur={field.handleBlur}
								disabled={isSubmitting}
								class={classNames?.input}
							/>

							{#if field.state.meta.errors.length > 0}
								<p class="text-sm font-medium text-destructive">
									{getFieldError(field.state.meta.errors[0])}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>

				<form.Field name="expiresInDays">
					{#snippet children(field)}
						<div class="space-y-2">
							<Label for="expiresInDays" class={classNames?.label}>
								{localization.EXPIRES}
							</Label>

							<Select.Root
								type="single"
								value={selectedExpiresInDays}
								onValueChange={(value?: string) => {
									if (value !== undefined) {
										selectedExpiresInDays = value;
										field.handleChange(value);
									}
								}}
								disabled={isSubmitting}
							>
								<Select.Trigger id="expiresInDays" class={classNames?.input}>
									{#if selectedExpiresInDays === 'none'}
										{localization.NO_EXPIRATION}
									{:else if selectedExpiresInDays === '365'}
										{rtf.format(1, 'year')}
									{:else}
										{rtf.format(Number.parseInt(selectedExpiresInDays), 'day')}
									{/if}
								</Select.Trigger>

								<Select.Content>
									<Select.Item value="none" label={localization.NO_EXPIRATION} />

									{#each expirationDays as days (days)}
										<Select.Item
											value={days.toString()}
											label={days === 365 ? rtf.format(1, 'year') : rtf.format(days, 'day')}
										/>
									{/each}
								</Select.Content>
							</Select.Root>

							{#if field.state.meta.errors.length > 0}
								<p class="text-sm font-medium text-destructive">
									{getFieldError(field.state.meta.errors[0])}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
			</div>

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
					variant="default"
					class={cn(classNames?.button, classNames?.primaryButton)}
					disabled={isSubmitting}
				>
					{#if isSubmitting}
						<Loader2 class="animate-spin" />
					{/if}
					{localization.CREATE_API_KEY}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
