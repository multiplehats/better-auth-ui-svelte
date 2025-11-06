import type { Component } from 'svelte';

export type Image = Component<{
	src: string;
	alt: string;
	class?: string;
}>;
