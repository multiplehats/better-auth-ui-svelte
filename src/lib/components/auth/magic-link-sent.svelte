<script lang="ts">
	import { onMount } from 'svelte';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';
	import MailOpen from '@lucide/svelte/icons/mail-open';

	interface Props {
		className?: string;
		classNames?: {
			base?: string;
			content?: string;
			description?: string;
			header?: string;
			title?: string;
			email?: string;
			icon?: string;
		};
		localization?: Partial<AuthLocalization>;
		email?: string;
	}

	let { className, classNames, localization: localizationProp, email: emailProp }: Props = $props();

	const config = getAuthUIConfig();
	const localization = $derived({ ...config.localization, ...localizationProp });

	// State management
	let email = $state(emailProp || '');
	let isResending = $state(false);
	let resendDisabled = $state(false);
	let countdown = $state(0);

	onMount(() => {
		// Try to get email from URL params
		const searchParams = new URLSearchParams(window.location.search);
		const emailParam = searchParams.get('email');

		if (emailParam) {
			email = emailParam; // URLSearchParams.get() already decodes the value
		}

		// Start cooldown immediately if user just arrived (they've already received initial email)
		if (email) {
			const magicLinkConfig = typeof config.magicLink === 'object' ? config.magicLink : {};
			const cooldownPeriod = magicLinkConfig.resendCooldown || 60;
			const storageKey = `better-auth-magic-link-cooldown-${email}`;

			// Check if there's an existing cooldown in localStorage
			const storedCooldown = localStorage.getItem(storageKey);
			if (storedCooldown) {
				const { expiresAt } = JSON.parse(storedCooldown);
				const remainingTime = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

				if (remainingTime > 0) {
					countdown = remainingTime;
					resendDisabled = true;
				} else {
					// Expired, remove it
					localStorage.removeItem(storageKey);
				}
			} else {
				// No stored cooldown, start a new one (user just sent magic link)
				countdown = cooldownPeriod;
				resendDisabled = true;

				// Store in localStorage
				localStorage.setItem(
					storageKey,
					JSON.stringify({
						expiresAt: Date.now() + cooldownPeriod * 1000
					})
				);
			}
		}
	});

	// Countdown timer effect
	$effect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => {
				countdown--;
			}, 1000);

			return () => clearTimeout(timer);
		} else if (resendDisabled) {
			// Countdown reached 0, re-enable button and clean up localStorage
			resendDisabled = false;
			if (email) {
				const storageKey = `better-auth-magic-link-cooldown-${email}`;
				localStorage.removeItem(storageKey);
			}
		}
	});

	const handleResendMagicLink = async () => {
		if (!email || resendDisabled) return;

		isResending = true;

		try {
			// Build the callback URL - this should go to wherever the magic link takes users
			const magicLinkSentPath = `${config.basePath}/${config.viewPaths.MAGIC_LINK_SENT}`;
			const magicLinkConfig = typeof config.magicLink === 'object' ? config.magicLink : {};

			await config.authClient.signIn.magicLink(
				{
					email,
					callbackURL: config.redirectTo || '/'
				},
				{
					onError: (ctx) => {
						throw new Error(ctx.error.message || 'Failed to send magic link');
					}
				}
			);

			config.toast.success(localization.MAGIC_LINK_EMAIL);

			// Start countdown with configured cooldown period
			const cooldownPeriod = magicLinkConfig.resendCooldown || 60;
			countdown = cooldownPeriod;
			resendDisabled = true;

			// Store in localStorage for persistence across page reloads
			const storageKey = `better-auth-magic-link-cooldown-${email}`;
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					expiresAt: Date.now() + cooldownPeriod * 1000
				})
			);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : localization.REQUEST_FAILED;
			config.toast.error(errorMessage);
		} finally {
			isResending = false;
		}
	};

	const handleBackToSignIn = () => {
		const signInPath = `${config.basePath}/${config.viewPaths.SIGN_IN}`;
		config.navigate(signInPath);
	};
</script>

<Card.Root class={cn('w-full max-w-sm', className, classNames?.base)}>
	<Card.Header class={cn('text-center', classNames?.header)}>
		<div
			class={cn(
				'mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10',
				classNames?.icon
			)}
		>
			<MailOpen class="size-6 text-primary" />
		</div>

		<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
			{localization.MAGIC_LINK_SENT}
		</Card.Title>

		<Card.Description class={cn('text-xs md:text-sm', classNames?.description)}>
			{localization.MAGIC_LINK_SENT_TO}
			{#if email}
				<span class={cn('mt-1 block font-medium text-foreground', classNames?.email)}>
					{email}
				</span>
			{/if}
		</Card.Description>
	</Card.Header>

	<Card.Content
		class={cn('grid gap-4 text-center text-sm text-muted-foreground', classNames?.content)}
	>
		<p>{localization.MAGIC_LINK_CHECK_INBOX}</p>
		<p>{localization.MAGIC_LINK_EXPIRES}</p>

		<div class="mt-4 flex flex-col gap-2">
			<div class="text-sm text-muted-foreground">
				{localization.MAGIC_LINK_NO_EMAIL}
			</div>

			<Button
				variant="outline"
				disabled={isResending || resendDisabled}
				onclick={handleResendMagicLink}
				class="w-full"
			>
				{#if countdown > 0}
					{localization.RESEND_MAGIC_LINK} ({countdown}s)
				{:else if isResending}
					{localization.RESEND_MAGIC_LINK}...
				{:else}
					{localization.RESEND_MAGIC_LINK}
				{/if}
			</Button>
		</div>

		<div class="mt-2">
			<Button variant="ghost" onclick={handleBackToSignIn} class="w-full">
				← {localization.BACK_TO_SIGN_IN}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
