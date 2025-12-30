<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { socialProviders } from '$lib/lib/social-providers.js';
	import { cn } from '$lib/utils/ui.js';
	import { getViewByPath } from '$lib/utils/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AuthForm, { type AuthFormClassNames } from './auth-form.svelte';
	import ProviderButton from './provider-button.svelte';
	import MagicLinkButton from './magic-link-button.svelte';
	import EmailOTPButton from './email-otp-button.svelte';
	import PasskeyButton from './passkey-button.svelte';
	import OneTap from './one-tap.svelte';
	import AuthCallback from './auth-callback.svelte';
	import SignOut from './sign-out.svelte';
	import VerifyEmail from './verify-email.svelte';
	import MagicLinkSent from './magic-link-sent.svelte';
	import type { AuthViewPath } from '$lib/utils/view-paths.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import AcceptInvitationCard from '../organization/accept-invitation-card.svelte';

	export interface AuthViewClassNames {
		base?: string;
		content?: string;
		description?: string;
		footer?: string;
		footerLink?: string;
		continueWith?: string;
		form?: AuthFormClassNames;
		header?: string;
		separator?: string;
		title?: string;
	}

	interface Props {
		className?: string;
		classNames?: AuthViewClassNames;
		/**
		 * A URL to redirect to after authentication actions.
		 *
		 * e.g. route the user to `/dashboard` after sign-in.
		 */
		callbackURL?: string;
		cardHeader?: Snippet;
		localization?: Partial<AuthLocalization>;
		path?: string;
		pathname?: string;
		redirectTo?: string;
		socialLayout?: 'auto' | 'horizontal' | 'grid' | 'vertical';
		view?: AuthViewPath;
		otpSeparators?: 0 | 1 | 2;
	}

	let {
		className,
		classNames,
		callbackURL,
		cardHeader,
		localization: localizationProp,
		path: pathProp,
		pathname,
		redirectTo,
		socialLayout: socialLayoutProp = 'auto',
		view: viewProp,
		otpSeparators = 0
	}: Props = $props();

	const config = getAuthUIConfig();

	// Merge context localization with prop localization
	const localization = $derived({ ...config.localization, ...localizationProp });

	const path = $derived(pathProp ?? pathname?.split('/').pop());

	// Determine view from prop, path, or default
	let view = $derived<AuthViewPath>(
		viewProp ||
			(getViewByPath(config.viewPaths || {}, path) as AuthViewPath | undefined) ||
			'SIGN_IN'
	);

	const credentials = $derived(config.credentials);
	const magicLink = $derived(config.magicLink);
	const emailOTP = $derived(config.emailOTP);
	const signUp = $derived(config.signUp);
	const passkey = $derived(config.passkey);
	const oneTap = $derived(config.oneTap);
	const social = $derived(config.social);
	const genericOAuth = $derived(config.genericOAuth);

	// Determine social layout
	let socialLayout = $derived(
		socialLayoutProp === 'auto'
			? !credentials
				? 'vertical'
				: social?.providers && social.providers.length > 2
					? 'horizontal'
					: 'vertical'
			: socialLayoutProp
	);

	let isSubmitting = $state(false);
	let isHydrated = $state(false);

	// Reset isSubmitting on page navigation and track hydration
	onMount(() => {
		isHydrated = true;
		const handlePageHide = () => (isSubmitting = false);
		window.addEventListener('pagehide', handlePageHide);
		return () => {
			isSubmitting = false;
			window.removeEventListener('pagehide', handlePageHide);
		};
	});

	// Get description for the current view
	const description = $derived(
		!credentials && !magicLink && !emailOTP
			? localization.DISABLED_CREDENTIALS_DESCRIPTION
			: localization[`${view}_DESCRIPTION` as keyof typeof localization]
	);
</script>

<!-- Handle special views that don't use the card layout -->
{#if view === 'CALLBACK'}
	<AuthCallback {redirectTo} />
{:else if view === 'SIGN_OUT'}
	<SignOut />
{:else if view === 'VERIFY_EMAIL'}
	<VerifyEmail {className} {classNames} {localization} />
{:else if view === 'MAGIC_LINK_SENT'}
	<MagicLinkSent {className} {classNames} {localization} />
{:else if view === 'ACCEPT_INVITATION'}
	<AcceptInvitationCard {localization} />
{:else}
	<!-- Main card layout for all other views -->
	<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
		<Card.Header class={classNames?.header}>
			{#if cardHeader}
				{@render cardHeader()}
			{:else}
				<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
					{localization[view as keyof typeof localization]}
				</Card.Title>
				{#if description}
					<Card.Description class={cn('text-xs md:text-sm', classNames?.description)}>
						{description}
					</Card.Description>
				{/if}
			{/if}
		</Card.Header>

		<Card.Content class={cn('grid gap-6', classNames?.content)}>
			<!-- Google One Tap -->
			{#if oneTap && ['SIGN_IN', 'SIGN_UP', 'MAGIC_LINK', 'EMAIL_OTP'].includes(view)}
				<OneTap {localization} {redirectTo} />
			{/if}

			{#if credentials || magicLink || emailOTP}
				<div class="grid gap-4">
					<AuthForm
						classNames={classNames?.form}
						{callbackURL}
						bind:isSubmitting
						{localization}
						{otpSeparators}
						{view}
						{redirectTo}
					/>

					<!-- Magic Link Button -->
					{#if magicLink && ((credentials && ['FORGOT_PASSWORD', 'SIGN_UP', 'SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP'].includes(view)) || (emailOTP && view === 'EMAIL_OTP'))}
						<MagicLinkButton {classNames} {localization} {view} {isSubmitting} />
					{/if}

					<!-- Email OTP Button -->
					{#if emailOTP && ((credentials && ['FORGOT_PASSWORD', 'SIGN_UP', 'SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP'].includes(view)) || (magicLink && ['SIGN_IN', 'MAGIC_LINK'].includes(view)))}
						<EmailOTPButton {classNames} {localization} {view} {isSubmitting} />
					{/if}
				</div>
			{/if}

			{#if view !== 'RESET_PASSWORD' && (social?.providers?.length || genericOAuth?.providers?.length || (view === 'SIGN_IN' && passkey))}
				<!-- Separator -->
				{#if credentials || magicLink || emailOTP}
					<div class={cn('flex items-center gap-2', classNames?.continueWith)}>
						<Separator class={cn('w-auto! grow', classNames?.separator)} />
						<span class="shrink-0 text-sm text-muted-foreground">
							{localization.OR_CONTINUE_WITH}
						</span>
						<Separator class={cn('w-auto! grow', classNames?.separator)} />
					</div>
				{/if}

				<div class="grid gap-4">
					<!-- Social providers -->
					{#if social?.providers?.length || genericOAuth?.providers?.length}
						<div
							class={cn(
								'flex w-full items-center justify-between gap-4',
								socialLayout === 'horizontal' && 'flex-wrap',
								socialLayout === 'vertical' && 'flex-col',
								socialLayout === 'grid' && 'grid grid-cols-2'
							)}
						>
							{#each social?.providers || [] as providerName (providerName)}
								{@const provider = socialProviders.find((p) => p.provider === providerName)}
								{#if provider}
									<ProviderButton
										{classNames}
										{callbackURL}
										{isSubmitting}
										{localization}
										{provider}
										{redirectTo}
										setIsSubmitting={(value) => (isSubmitting = value)}
										{socialLayout}
									/>
								{/if}
							{/each}

							{#each genericOAuth?.providers || [] as provider (provider.providerId)}
								<ProviderButton
									{classNames}
									{callbackURL}
									{isSubmitting}
									{localization}
									{provider}
									{redirectTo}
									setIsSubmitting={(value) => (isSubmitting = value)}
									{socialLayout}
									other
								/>
							{/each}
						</div>
					{/if}

					<!-- Passkey Button -->
					{#if passkey && ['SIGN_IN', 'MAGIC_LINK', 'EMAIL_OTP', 'RECOVER_ACCOUNT', 'TWO_FACTOR', 'FORGOT_PASSWORD'].includes(view)}
						<PasskeyButton
							{classNames}
							{isSubmitting}
							{localization}
							{redirectTo}
							setIsSubmitting={(value) => (isSubmitting = value)}
						/>
					{/if}
				</div>
			{/if}
		</Card.Content>

		{#if credentials && signUp}
			<Card.Footer
				class={cn('justify-center gap-1.5 text-sm text-muted-foreground', classNames?.footer)}
			>
				{#if view === 'SIGN_IN' || view === 'MAGIC_LINK' || view === 'EMAIL_OTP'}
					{localization.DONT_HAVE_AN_ACCOUNT}
				{:else if view === 'SIGN_UP'}
					{localization.ALREADY_HAVE_AN_ACCOUNT}
				{:else}
					<ArrowLeft class="size-3" />
				{/if}

				{#if view === 'SIGN_IN' || view === 'MAGIC_LINK' || view === 'EMAIL_OTP' || view === 'SIGN_UP'}
					{@const targetView =
						view === 'SIGN_IN' || view === 'MAGIC_LINK' || view === 'EMAIL_OTP'
							? 'SIGN_UP'
							: 'SIGN_IN'}
					{@const targetPath = config.viewPaths[targetView]}
					{@const href = `${config.basePath}/${targetPath}${isHydrated ? window.location.search : ''}`}
					{@const LinkComponent = config.Link}

					<LinkComponent {href} class={cn('text-foreground underline', classNames?.footerLink)}>
						<Button
							variant="link"
							size="sm"
							class={cn('px-0 text-foreground underline', classNames?.footerLink)}
						>
							{localization[targetView]}
						</Button>
					</LinkComponent>
				{:else}
					<Button
						variant="link"
						size="sm"
						class={cn('px-0 text-foreground underline', classNames?.footerLink)}
						onclick={() => window.history.back()}
					>
						{localization.GO_BACK}
					</Button>
				{/if}
			</Card.Footer>
		{/if}
	</Card.Root>
{/if}
