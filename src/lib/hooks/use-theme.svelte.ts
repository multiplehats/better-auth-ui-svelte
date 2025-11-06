import { onMount } from 'svelte';

/**
 * Hook that tracks the theme (light/dark) by observing the html element
 */
export function useTheme() {
	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const checkTheme = () => {
			const isDark =
				document.documentElement.classList.contains('dark') ||
				document.documentElement.getAttribute('style')?.includes('color-scheme: dark');
			theme = isDark ? 'dark' : 'light';
		};

		// Initial check
		checkTheme();

		// Listen for changes to html tag
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
					checkTheme();
				}
			}
		});

		observer.observe(document.documentElement, { attributes: true });

		return () => {
			observer.disconnect();
		};
	});

	return {
		get theme() {
			return theme;
		}
	};
}
