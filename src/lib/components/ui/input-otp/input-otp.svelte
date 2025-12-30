<script lang="ts">
	import { PinInput as InputOTPPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/ui.js';
	import type { Snippet } from 'svelte';

	interface PinInputCell {
		char: string | null | undefined;
		isActive: boolean;
		hasFakeCaret: boolean;
	}

	interface PinInputRootSnippetProps {
		cells: PinInputCell[];
		isFocused: boolean;
		isHovering: boolean;
	}

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(''),
		...restProps
	}: InputOTPPrimitive.RootProps & {
		children?: Snippet<[PinInputRootSnippetProps]>;
	} = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:value
	data-slot="input-otp"
	class={cn(
		'flex items-center gap-2 has-disabled:opacity-50 [&_input]:disabled:cursor-not-allowed',
		className
	)}
	{...restProps}
>
	{#snippet children(snippetProps)}
		{@render children?.(snippetProps)}
	{/snippet}
</InputOTPPrimitive.Root>
