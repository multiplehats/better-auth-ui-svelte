<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { getAuthClient, getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError, getSearchParam } from '$lib/utils/utils.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../settings/shared/settings-card.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import OrganizationCellView from './organization-cell-view.svelte';
	import { browser } from '$app/environment';

	export type AcceptInvitationInnerClassNames = SettingsCardClassNames;

	interface Props {
		class?: string;
		classNames?: AcceptInvitationInnerClassNames;
		localization: AuthLocalization;
		invitationId: string;
	}

	let { class: className, classNames, localization, invitationId }: Props = $props();

	const authClient = getAuthClient();
	const config = getAuthUIConfig();

	const { redirectTo, replace, toast, organization: organizationOptions } = config;

	// Hook called unconditionally at top level — invitationId is guaranteed by the parent.
	// useInvitation is an init-only hook accepting plain values; invitationId is stable per mount
	// svelte-ignore state_referenced_locally
	const invitationHook = config.hooks.useInvitation({ id: invitationId });
	const invitation = $derived(invitationHook?.data ?? null);
	const isPending = $derived(invitationHook?.isPending ?? false);

	let isRejecting = $state(false);
	let isAccepting = $state(false);
	const isProcessing = $derived(isRejecting || isAccepting);

	const builtInRoles = $derived([
		{ role: 'owner', label: localization.OWNER },
		{ role: 'admin', label: localization.ADMIN },
		{ role: 'member', label: localization.MEMBER }
	]);
	const roles = $derived([...builtInRoles, ...(organizationOptions?.customRoles || [])]);
	const roleLabel = $derived(
		roles.find((r) => r.role === invitation?.role)?.label || invitation?.role
	);

	// Resolve an inline error message for the current invitation state.
	// We surface errors inline (no redirect) so the user can actually see what
	// went wrong — e.g. this invitation was sent to a different email than the
	// one they're signed in as, or the invitation is expired/not found.
	//
	// NOTE: better-auth's organization error codes are passed to
	// `APIError.from` as plain strings (not `{ code, message }`), so the 403
	// response body serializes without a usable `code`/`message`. The only
	// reliable differentiator is the HTTP status: 403 = recipient mismatch (or
	// email-unverified), 400 = not found/expired.
	const errorStatus = $derived(
		(invitationHook?.error as { status?: number } | null)?.status ?? null
	);

	const errorMessage = $derived.by(() => {
		if (!isPending && !invitation) {
			if (errorStatus === 403) {
				return localization.INVITATION_RECIPIENT_MISMATCH;
			}
			return localization.INVITATION_NOT_FOUND;
		}
		if (
			invitation &&
			(invitation.status !== 'pending' || new Date(invitation.expiresAt) < new Date())
		) {
			return new Date(invitation.expiresAt) < new Date()
				? localization.INVITATION_EXPIRED
				: localization.INVITATION_NOT_FOUND;
		}
		return null;
	});

	async function handleReject() {
		isRejecting = true;
		try {
			await authClient.organization.rejectInvitation({
				invitationId,
				fetchOptions: { throw: true }
			});
			toast.success(localization.INVITATION_REJECTED);
			replace(redirectTo);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
			isRejecting = false;
		}
	}

	async function handleAccept() {
		isAccepting = true;
		try {
			await authClient.organization.acceptInvitation({
				invitationId,
				fetchOptions: { throw: true }
			});
			toast.success(localization.INVITATION_ACCEPTED || 'Invitation accepted');
			const redirectPath = browser ? getSearchParam('redirectTo') : null;
			replace(redirectPath || redirectTo);
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));
			isAccepting = false;
		}
	}
</script>

{#if errorMessage}
	<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
		<Card.Header class={cn('justify-items-center text-center', classNames?.header)}>
			<div class="flex items-center justify-center text-muted-foreground">
				<CircleAlert class="size-8" />
			</div>
			<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.ACCEPT_INVITATION}
			</Card.Title>
		</Card.Header>

		<Card.Content class={cn('flex flex-col gap-2', classNames?.content)}>
			<p class="text-center text-sm text-muted-foreground">{errorMessage}</p>
		</Card.Content>
	</Card.Root>
{:else if !invitation}
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
	<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
		<Card.Header class={cn('justify-items-center text-center', classNames?.header)}>
			<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
				{localization.ACCEPT_INVITATION}
			</Card.Title>
			<Card.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{localization.ACCEPT_INVITATION_DESCRIPTION}
			</Card.Description>
		</Card.Header>

		<Card.Content class={cn('flex flex-col gap-6 truncate', classNames?.content)}>
			<Card.Root class={cn('flex-row items-center p-4')}>
				<OrganizationCellView
					organization={{
						id: invitation.organizationId,
						name: invitation.organizationName,
						slug: invitation.organizationSlug,
						logo: invitation.organizationLogo,
						createdAt: new Date()
					}}
					{localization}
				/>
				<p class="ml-auto text-sm text-muted-foreground">{roleLabel}</p>
			</Card.Root>

			<div class="grid grid-cols-2 gap-3">
				<Button
					variant="outline"
					class={cn(classNames?.button, classNames?.outlineButton)}
					onclick={handleReject}
					disabled={isProcessing}
				>
					{#if isRejecting}
						<Loader2 class="animate-spin" />
					{:else}
						<X />
					{/if}
					{localization.REJECT}
				</Button>

				<Button
					class={cn(classNames?.button, classNames?.primaryButton)}
					onclick={handleAccept}
					disabled={isProcessing}
				>
					{#if isAccepting}
						<Loader2 class="animate-spin" />
					{:else}
						<Check />
					{/if}
					{localization.ACCEPT}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
