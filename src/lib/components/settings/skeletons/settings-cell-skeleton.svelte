<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
	}

	let { classNames }: Props = $props();
</script>

<Card.Root class={cn('flex-row items-center gap-3 px-4 py-3', classNames?.cell)}>
	<div class="flex items-center gap-2">
		<Skeleton class={cn('size-5 rounded-full', classNames?.skeleton)} />

		<div>
			<Skeleton class={cn('h-4 w-24', classNames?.skeleton)} />
		</div>
	</div>

	<Skeleton class={cn('ms-auto size-8 w-12', classNames?.skeleton)} />
</Card.Root>
