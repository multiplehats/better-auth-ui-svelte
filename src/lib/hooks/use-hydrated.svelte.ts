import { onMount } from 'svelte';

/**
 * Returns whether the component has been hydrated
 * In Svelte, this is equivalent to checking if we're on the client
 */
export function useIsHydrated() {
	let hydrated = $state(false);

	onMount(() => {
		hydrated = true;
	});

	return {
		get value() {
			return hydrated;
		}
	};
}
