<script lang="ts">
	import { PinInput as InputOTPPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		children,
		...restProps
	}: InputOTPPrimitive.RootProps & {
		children?: Snippet<[InputOTPPrimitive.SnippetProps]>;
	} = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:value
	data-slot="input-otp"
	class={cn(
		"has-disabled:opacity-50 flex items-center gap-2 [&_input]:disabled:cursor-not-allowed",
		className
	)}
	{...restProps}
>
	{#snippet children(snippetProps)}
		{@render children?.(snippetProps)}
	{/snippet}
</InputOTPPrimitive.Root>
