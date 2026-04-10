<script lang="ts">
	/* eslint-disable svelte/no-unused-props */
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import type { User } from 'better-auth';
	import type { Organization, Member } from 'better-auth/plugins/organization';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import MailIcon from '@lucide/svelte/icons/mail';
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
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import UserView from '../user-view.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		organization: Organization;
		team: { id: string; name: string };
		existingTeamMemberIds: string[];
		localization?: Partial<AuthLocalization>;
		onAdded?: () => void;
	}

	let {
		classNames,
		open = $bindable(false),
		onOpenChange,
		organization,
		team,
		existingTeamMemberIds,
		localization: propLocalization,
		onAdded
	}: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { hooks, toast } = config;

	const localization = $derived({ ...contextLocalization, ...propLocalization });

	// Fetch org members to show available ones
	const membersHook = hooks.useListMembers({
		get query() {
			return { organizationId: organization.id };
		}
	});
	const members = $derived(membersHook?.data?.members ?? []);
	const availableMembers = $derived(
		members.filter(
			(m: Member & { user?: Partial<User> | null }) =>
				!existingTeamMemberIds.includes(m.userId)
		)
	);

	let mode = $state<'pick' | 'invite'>('pick');
	let isAdding = $state(false);

	async function addExistingMember(userId: string) {
		isAdding = true;
		try {
			await // eslint-disable-next-line @typescript-eslint/no-explicit-any
			(authClient.organization as any).addTeamMember({
				teamId: team.id,
				userId,
				fetchOptions: { throw: true }
			});

			toast.success(localization.ADD_TEAM_MEMBER_SUCCESS);
			onAdded?.();
			handleOpenChange(false);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
		}
		isAdding = false;
	}

	// Invite by email form
	const formSchema = $derived(
		z.object({
			email: z
				.string()
				.min(1, { message: localization.EMAIL_REQUIRED })
				.email({ message: localization.INVALID_EMAIL })
		})
	);

	const form = createForm(() => ({
		defaultValues: { email: '' },
		onSubmit: async ({ value }) => {
			try {
				await // eslint-disable-next-line @typescript-eslint/no-explicit-any
				(authClient.organization as any).inviteMember({
					email: value.email,
					role: 'member',
					organizationId: organization.id,
					teamId: team.id,
					fetchOptions: { throw: true }
				});

				toast.success(localization.SEND_INVITATION_SUCCESS);
				onAdded?.();
				handleOpenChange(false);
				form.reset();
				mode = 'pick';
			} catch (error) {
				toast.error(getLocalizedError({ error, localization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		onOpenChange?.(newOpen);
		if (!newOpen) {
			mode = 'pick';
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class={cn('max-w-lg', classNames?.dialog?.content)}>
		<Dialog.Header class={classNames?.dialog?.header}>
			<Dialog.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.ADD_TEAM_MEMBER}
			</Dialog.Title>
			<Dialog.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.ADD_TEAM_MEMBER_DESCRIPTION}
			</Dialog.Description>
		</Dialog.Header>

		{#if mode === 'pick'}
			<div class="space-y-2">
				{#if availableMembers.length > 0}
					<div class="max-h-64 space-y-2 overflow-y-auto">
						{#each availableMembers as member (member.id)}
							<Card.Root
								class={cn(
									'flex-row items-center p-3 cursor-pointer hover:bg-accent transition-colors',
									classNames?.cell
								)}
								onclick={() => addExistingMember(member.userId)}
							>
								<UserView user={member.user} {localization} className="flex-1" />
								{#if isAdding}
									<Loader2 class="size-4 animate-spin" />
								{:else}
									<UserPlusIcon class="size-4 opacity-50" />
								{/if}
							</Card.Root>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground py-4 text-center">
						{localization.ALL_MEMBERS_IN_TEAM}
					</p>
				{/if}
			</div>

			<Dialog.Footer class={cn('flex-col sm:flex-row', classNames?.dialog?.footer)}>
				<Button
					type="button"
					variant="outline"
					onclick={() => handleOpenChange(false)}
					class={cn('sm:mr-auto', classNames?.button, classNames?.outlineButton)}
				>
					{localization.CANCEL}
				</Button>
				<Button
					type="button"
					variant="outline"
					onclick={() => (mode = 'invite')}
					class={cn(classNames?.button, classNames?.outlineButton)}
				>
					<MailIcon class="size-4" />
					{localization.INVITE_MEMBER}
				</Button>
			</Dialog.Footer>
		{:else}
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
							<Label for="invite-email" class={classNames?.label}>
								{localization.EMAIL}
							</Label>
							<Input
								id="invite-email"
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

				<Dialog.Footer class={classNames?.dialog?.footer}>
					<Button
						type="button"
						variant="outline"
						onclick={() => (mode = 'pick')}
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
		{/if}
	</Dialog.Content>
</Dialog.Root>
