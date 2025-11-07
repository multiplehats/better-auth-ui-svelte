<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';

	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { SettingsCardClassNames } from './settings-card.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		className?: string;
		classNames?: SettingsCardClassNames;
		description?: Snippet | string;
		isPending?: boolean;
		title: Snippet | string;
	}

	let { className, classNames, description, isPending, title }: Props = $props();
</script>

<Card.Header class={cn(classNames?.header, className)}>
	{#if isPending}
		<Skeleton class={cn('my-0.5 h-5 w-1/3 md:h-5.5', classNames?.skeleton)} />

		{#if description}
			<Skeleton class={cn('mt-1.5 mb-0.5 h-3 w-2/3 md:h-3.5', classNames?.skeleton)} />
		{/if}
	{:else}
		<Card.Title class={cn('text-lg md:text-xl', classNames?.title)}>
			{#if typeof title === 'string'}
				{title}
			{:else}
				{@render title()}
			{/if}
		</Card.Title>

		{#if description}
			<Card.Description class={cn('text-xs md:text-sm', classNames?.description)}>
				{#if typeof description === 'string'}
					{description}
				{:else}
					{@render description()}
				{/if}
			</Card.Description>
		{/if}
	{/if}
</Card.Header>
