<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js';
	import Loader2 from '@lucide/svelte/icons/loader';
	import type { SettingsCardClassNames } from './settings-card.svelte';
	import type { Snippet } from 'svelte';

	interface Props extends Omit<ButtonProps, 'children'> {
		classNames?: SettingsCardClassNames;
		actionLabel: Snippet | string;
		disabled?: boolean;
		isSubmitting?: boolean;
		variant?: 'default' | 'destructive';
		onclick?: (() => unknown) | undefined;
	}

	let { classNames, actionLabel, disabled, isSubmitting, variant, onclick, ...restProps }: Props =
		$props();
</script>

<Button
	class={cn(
		'md:ms-auto',
		classNames?.button,
		variant === 'default' && classNames?.primaryButton,
		variant === 'destructive' && classNames?.destructiveButton
	)}
	disabled={isSubmitting || disabled}
	size="sm"
	type={onclick ? 'button' : 'submit'}
	{variant}
	{onclick}
	{...restProps}
>
	{#if isSubmitting}
		<Loader2 class="animate-spin" />
	{/if}
	{#if typeof actionLabel === 'string'}
		{actionLabel}
	{:else}
		{@render actionLabel()}
	{/if}
</Button>
