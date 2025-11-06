import type { Component, Snippet } from 'svelte';

export type Link = Component<{
	href: string;
	class?: string;
	children: Snippet;
}>;
