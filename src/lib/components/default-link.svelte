<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		class?: string;
		children: Snippet;
	}

	let { href, class: className, children }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a {href} data-sveltekit-reload class={className}>
	{@render children()}
</a>
