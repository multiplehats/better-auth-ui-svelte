<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		class?: string;
		children: Snippet;
	}

	let { href, class: className, children }: Props = $props();
</script>

<a {href} class={className}>
	{@render children()}
</a>
