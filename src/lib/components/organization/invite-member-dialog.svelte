<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import type { Organization, Member } from 'better-auth/plugins/organization';
	import type { User } from 'better-auth';
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
	import * as Select from '$lib/components/ui/select/index.js';

	interface Props {
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		organization: Organization;
		localization?: Partial<AuthLocalization>;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		organization,
		localization: propLocalization
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { hooks, toast, organization: organizationOptions } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// Fetch members to determine current user's role
	const membersHook = hooks.useListMembers({
		query: { organizationId: organization.id }
	});
	const membersData = $derived(membersHook?.data);
	const members = $derived(membersData?.members);

	// Fetch invitations for refetch
	const invitationsHook = hooks.useListInvitations({
		query: { organizationId: organization.id }
	});
	const refetchInvitations = invitationsHook?.refetch;

	// Get current user's session
	const sessionStore = hooks.useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const membership = $derived(
		members?.find(
			(m: Member & { user?: Partial<User> | null }) => m.userId === sessionData?.user.id
		)
	);

	// Define roles - use $derived to capture localization changes
	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	] as const);

	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);
	const availableRoles = $derived(
		roles.filter((role) => membership?.role === 'owner' || role.role !== 'owner')
	);

	// Form validation schema - use $derived to capture localization changes
	const formSchema = $derived(
		z.object({
			email: z
				.string()
				.min(1, { message: localization.EMAIL_REQUIRED })
				.email({ message: localization.INVALID_EMAIL }),
			role: z.string().min(1, {
				message: `${localization.ROLE} ${localization.IS_REQUIRED}`
			})
		})
	);

	// Track selected role for Select component
	let selectedRole = $state('member');

	// Create form
	const form = createForm(() => ({
		defaultValues: {
			email: '',
			role: 'member'
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.organization.inviteMember({
					email: value.email,
					role: value.role as (typeof builtInRoles)[number]['role'],
					organizationId: organization.id,
					fetchOptions: { throw: true }
				});

				await refetchInvitations?.();

				handleOpenChange(false);
				form.reset();
				selectedRole = 'member';

				toast.success(localization.SEND_INVITATION_SUCCESS || 'Invitation sent successfully');
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
				{localization.INVITE_MEMBER}
			</Dialog.Title>

			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.INVITE_MEMBER_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			class="space-y-6"
		>
			<form.Field name="email" validators={{ onChange: formSchema.shape.email }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for="email" class={classNames?.label}>
							{localization.EMAIL}
						</Label>

						<Input
							id="email"
							placeholder={localization.EMAIL_PLACEHOLDER}
							type="email"
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

			<form.Field name="role" validators={{ onChange: formSchema.shape.role }}>
				{#snippet children(field)}
					<div class="space-y-2">
						<Label for="role" class={classNames?.label}>
							{localization.ROLE}
						</Label>

						<Select.Root
							type="single"
							value={selectedRole}
							onValueChange={(value?: string) => {
								if (value) {
									selectedRole = value;
									field.handleChange(value);
								}
							}}
							disabled={isSubmitting}
						>
							<Select.Trigger id="role" class="w-full">
								{#if selectedRole}
									{#each availableRoles as role (role.role)}
										{#if role.role === selectedRole}
											<span>{role.label}</span>
										{/if}
									{/each}
								{:else}
									<span>{localization.SELECT_ROLE}</span>
								{/if}
							</Select.Trigger>

							<Select.Content>
								{#each availableRoles as role (role.role)}
									<Select.Item value={role.role} label={role.label} />
								{/each}
							</Select.Content>
						</Select.Root>

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
					{localization.SEND_INVITATION}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
