<script lang="ts">
	import * as ResizablePrimitive from 'paneforge';
	import { cn } from '$lib/utils/ui.js';

	let {
		// eslint-disable-next-line no-useless-assignment -- $bindable default for parent binding; the underlying element ref is exposed via the `this` prop
		ref = $bindable(null),
		this: paneGroup = $bindable(),
		class: className,
		...restProps
	}: ResizablePrimitive.PaneGroupProps & {
		this?: ResizablePrimitive.PaneGroup;
	} = $props();
</script>

<ResizablePrimitive.PaneGroup
	bind:this={paneGroup}
	data-slot="resizable-pane-group"
	class={cn('flex h-full w-full data-[direction=vertical]:flex-col', className)}
	{...restProps}
/>
