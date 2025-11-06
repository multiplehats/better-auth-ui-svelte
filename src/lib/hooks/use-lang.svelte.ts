import { onMount } from 'svelte';

/**
 * Hook that tracks the lang attribute on the html element
 */
export function useLang() {
	let lang = $state<string | undefined>(undefined);

	onMount(() => {
		const checkLang = () => {
			const currentLang = document.documentElement.getAttribute('lang');
			lang = currentLang ?? undefined;
		};

		// Initial check
		checkLang();

		// Listen for changes to lang attribute on html tag
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.attributeName === 'lang') {
					checkLang();
				}
			}
		});

		observer.observe(document.documentElement, { attributes: true });

		return () => {
			observer.disconnect();
		};
	});

	return {
		get lang() {
			return lang;
		}
	};
}
