import type { ReadableAtom, WritableAtom } from 'nanostores';

/**
 * Converts a nanostore (atom) to a Svelte 5 reactive value using runes.
 * This helper bridges the gap between nanostores and Svelte 5's rune-based reactivity.
 *
 * IMPORTANT: This function must be called during component initialization to work properly.
 * The subscription is automatically cleaned up when the component is destroyed.
 *
 * @param store - A nanostore atom (can be readable or writable, including partially initialized)
 * @returns A reactive value that automatically updates when the store changes
 *
 * @example
 * ```ts
 * import { atom } from 'nanostores';
 * import { fromStore } from '$lib/utils/store-to-rune.svelte';
 *
 * const count$ = atom(0);
 * const count = fromStore(count$);
 *
 * // count is now reactive and will update when count$ changes
 * console.log(count.value);
 * ```
 */
export function fromStore<T>(
	store: Partial<ReadableAtom<T> | WritableAtom<T>> & {
		get?: () => T;
		listen?: (callback: (value: T) => void) => () => void;
	}
) {
	// Handle partially initialized stores
	let value = $state(store.get?.() as T);

	// Use $effect to subscribe to the store
	// The effect automatically cleans up when the component is destroyed
	$effect(() => {
		if (!store.listen) return;

		const unsubscribe = store.listen((newValue) => {
			value = newValue;
		});

		return () => {
			unsubscribe();
		};
	});

	return {
		get value() {
			return value;
		}
	};
}

/**
 * Converts a computed nanostore to a Svelte 5 reactive value.
 * Similar to fromStore but optimized for computed stores.
 *
 * @param store - A nanostore computed store
 * @returns A reactive value that automatically updates when the store's dependencies change
 */
export function fromComputed<T>(store: ReadableAtom<T>) {
	return fromStore(store);
}
