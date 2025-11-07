<script lang="ts">
	import { cn } from '$lib/utils/ui.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	interface Props {
		classNames?: SettingsCardClassNames;
	}

	let { classNames }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	<Skeleton class={cn('h-4 w-32', classNames?.skeleton)} />
	<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
</div>
