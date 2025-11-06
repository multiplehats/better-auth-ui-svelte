<script lang="ts">
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils/utils.js';
	import type { ChangeEventHandler, FullAutoFill } from 'svelte/elements';

	interface Props {
		class?: string;
		enableToggle?: boolean;
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		autocomplete?: FullAutoFill | null | undefined;
		id?: string;
		name?: string;
		onchange?: ChangeEventHandler<HTMLInputElement> | null | undefined;
	}

	let {
		class: className,
		enableToggle = true,
		value = $bindable(''),
		disabled,
		placeholder,
		autocomplete,
		id,
		name,
		onchange,
		...restProps
	}: Props = $props();

	let isDisabled = $state(true);
	let isVisible = $state(false);

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		const target = event.currentTarget;
		isDisabled = !target.value;
		if (onchange) {
			onchange(event);
		}
	}

	function toggleVisibility() {
		isVisible = !isVisible;
	}
</script>

<div class="relative">
	<Input
		{id}
		{name}
		type={isVisible && enableToggle ? 'text' : 'password'}
		class={cn(enableToggle && 'pr-10', 'hide-password-toggle', className)}
		bind:value
		{disabled}
		{placeholder}
		{autocomplete}
		onchange={handleChange}
		{...restProps}
	/>

	{#if enableToggle}
		<Button
			class="absolute top-0 right-0 bg-transparent!"
			disabled={isDisabled || disabled}
			size="icon"
			type="button"
			variant="ghost"
			onclick={toggleVisibility}
		>
			{#if isVisible}
				<EyeIcon class="h-4 w-4" />
			{:else}
				<EyeOffIcon class="h-4 w-4" />
			{/if}
		</Button>
	{/if}
</div>

<style>
	:global(.hide-password-toggle::-ms-reveal),
	:global(.hide-password-toggle::-ms-clear) {
		visibility: hidden;
		pointer-events: none;
		display: none;
	}
</style>
