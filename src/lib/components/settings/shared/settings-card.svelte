<script lang="ts" module>
	import type { UserAvatarClassNames } from '$lib/components/user-avatar.svelte';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { Snippet } from 'svelte';

	export type SettingsCardClassNames = {
		base?: string;
		avatar?: UserAvatarClassNames;
		button?: string;
		cell?: string;
		checkbox?: string;
		destructiveButton?: string;
		content?: string;
		description?: string;
		dialog?: {
			content?: string;
			footer?: string;
			header?: string;
		};
		error?: string;
		footer?: string;
		header?: string;
		icon?: string;
		input?: string;
		instructions?: string;
		label?: string;
		primaryButton?: string;
		secondaryButton?: string;
		outlineButton?: string;
		skeleton?: string;
		title?: string;
	};

	export interface SettingsCardProps {
		children?: Snippet;
		className?: string;
		classNames?: SettingsCardClassNames;
		title?: Snippet | string;
		description?: Snippet | string;
		instructions?: Snippet | string;
		actionLabel?: Snippet | string;
		isSubmitting?: boolean;
		disabled?: boolean;
		isPending?: boolean;
		optimistic?: boolean;
		variant?: 'default' | 'destructive';
		localization?: Partial<AuthLocalization>;
		action?: () => Promise<unknown> | unknown;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import SettingsCardHeader from './settings-card-header.svelte';
	import SettingsCardFooter from './settings-card-footer.svelte';

	let {
		children,
		className,
		classNames,
		title,
		description,
		instructions,
		actionLabel,
		disabled,
		isPending,
		isSubmitting,
		optimistic,
		variant,
		action
	}: SettingsCardProps = $props();
</script>

<Card.Root
	class={cn(
		'w-full pb-0 text-start',
		variant === 'destructive' && 'border-destructive/40',
		className,
		classNames?.base
	)}
>
	{#if title}
		<SettingsCardHeader {classNames} {description} {isPending} {title} />
	{/if}

	{#if children}
		{@render children()}
	{/if}

	<SettingsCardFooter
		{classNames}
		{actionLabel}
		{disabled}
		{isPending}
		{isSubmitting}
		{instructions}
		{optimistic}
		{variant}
		{action}
	/>
</Card.Root>
