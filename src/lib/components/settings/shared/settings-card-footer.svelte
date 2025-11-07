<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import SettingsActionButton from './settings-action-button.svelte';
	import type { SettingsCardClassNames } from './settings-card.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		actionLabel?: Snippet | string;
		disabled?: boolean;
		instructions?: Snippet | string;
		isPending?: boolean;
		isSubmitting?: boolean;
		optimistic?: boolean;
		variant?: 'default' | 'destructive';
		action?: () => Promise<unknown> | unknown;
	}

	let {
		className,
		classNames,
		actionLabel,
		disabled,
		instructions,
		isPending,
		isSubmitting,
		variant,
		action
	}: Props = $props();
</script>

<Card.Footer
	class={cn(
		'flex flex-col justify-between gap-4 rounded-b-xl md:flex-row',
		(actionLabel || instructions) && 'border-t py-4!',
		variant === 'destructive' ? 'border-destructive/30 bg-destructive/15' : 'bg-sidebar',
		className,
		classNames?.footer
	)}
>
	{#if isPending}
		{#if instructions}
			<Skeleton class={cn('my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56', classNames?.skeleton)} />
		{/if}

		{#if actionLabel}
			<Skeleton class={cn('h-8 w-14 md:ms-auto', classNames?.skeleton)} />
		{/if}
	{:else}
		{#if instructions}
			<Card.Description
				class={cn(
					'text-center text-xs text-muted-foreground md:text-start md:text-sm',
					classNames?.instructions
				)}
			>
				{#if typeof instructions === 'string'}
					{instructions}
				{:else}
					{@render instructions()}
				{/if}
			</Card.Description>
		{/if}

		{#if actionLabel}
			<SettingsActionButton
				{classNames}
				{actionLabel}
				{disabled}
				{isSubmitting}
				{variant}
				onclick={action}
			/>
		{/if}
	{/if}
</Card.Footer>
