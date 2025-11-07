import { authDataCache } from '../utils/auth-data-cache.js';
import { getAuthUIConfig } from '../context/auth-ui-config.svelte.js';
import { fromStore } from '../utils/store-to-rune.svelte.js';
import type { BetterFetchError } from '@better-fetch/fetch';

export function useAuthData<T>({
	queryFn,
	cacheKey,
	staleTime = 10000 // Default 10 seconds
}: {
	queryFn: () => Promise<{ data: T | null; error?: BetterFetchError | null }>;
	cacheKey?: string;
	staleTime?: number;
}) {
	const config = getAuthUIConfig();
	const { authClient, toast, localization } = config;

	// Generate a stable cache key
	const stableCacheKey = cacheKey || queryFn.toString();

	// Reactive state using Svelte 5 runes
	let data = $state<T | null>(null);
	let isPending = $state(true);
	let isRefetching = $state(false);
	let error = $state<BetterFetchError | null>(null);
	let initialized = $state(false);
	let previousUserId = $state<string | undefined>(undefined);

	const sessionStore = authClient.useSession();
	const session = fromStore(sessionStore);
	const sessionData = $derived(session.value?.data);
	const sessionPending = $derived(session.value?.isPending ?? true);

	// Subscribe to cache updates
	const unsubscribe = authDataCache.subscribe(stableCacheKey, () => {
		const cacheEntry = authDataCache.get<T>(stableCacheKey);
		if (cacheEntry) {
			data = cacheEntry.data;
			isRefetching = cacheEntry.isRefetching;
		}
	});

	// Refetch function
	async function refetch() {
		// Check if there's already an in-flight request for this key
		const existingRequest = authDataCache.getInFlightRequest<{
			data: T | null;
			error?: BetterFetchError | null;
		}>(stableCacheKey);
		if (existingRequest) {
			try {
				const result = await existingRequest;
				if (result.error) {
					error = result.error;
				} else {
					error = null;
				}
			} catch (err) {
				error = err as BetterFetchError;
			}
			return;
		}

		// Mark as refetching if we have cached data
		const cacheEntry = authDataCache.get<T>(stableCacheKey);
		if (cacheEntry?.data !== undefined) {
			authDataCache.setRefetching(stableCacheKey, true);
		}

		// Create the fetch promise
		const fetchPromise = queryFn();

		// Store the promise as in-flight
		authDataCache.setInFlightRequest(stableCacheKey, fetchPromise);

		try {
			const { data: fetchedData, error: fetchError } = await fetchPromise;

			if (fetchError) {
				error = fetchError;
				toast.error(getLocalizedError({ error: fetchError, localization }));
			} else {
				error = null;
			}

			// Update cache with new data
			authDataCache.set(stableCacheKey, fetchedData);
		} catch (err) {
			const fetchError = err as BetterFetchError;
			error = fetchError;
			toast.error(getLocalizedError({ error: fetchError, localization }));
		} finally {
			authDataCache.setRefetching(stableCacheKey, false);
			authDataCache.removeInFlightRequest(stableCacheKey);
		}
	}

	// Effect to handle session changes and auto-fetching
	$effect(() => {
		const currentUserId = sessionData?.user?.id;

		if (!sessionData) {
			// Clear cache when session is lost
			authDataCache.setRefetching(stableCacheKey, false);
			authDataCache.clear(stableCacheKey);
			initialized = false;
			previousUserId = undefined;
			return;
		}

		// Check if user ID has changed
		const userIdChanged = previousUserId !== undefined && previousUserId !== currentUserId;

		// If user changed, clear cache to ensure isPending becomes true
		if (userIdChanged) {
			authDataCache.clear(stableCacheKey);
		}

		// Get cached entry
		const cacheEntry = authDataCache.get<T>(stableCacheKey);
		const hasCachedData = cacheEntry?.data !== undefined;

		// Check if data is stale
		const isStale = !cacheEntry || Date.now() - cacheEntry.timestamp > staleTime;

		if (!initialized || !hasCachedData || userIdChanged || (hasCachedData && isStale)) {
			// Only fetch if we don't have data or if the data is stale
			if (!hasCachedData || isStale) {
				initialized = true;
				refetch();
			}
		}

		// Update the previous user ID
		previousUserId = currentUserId;
	});

	// Update isPending based on session and cache state
	$effect(() => {
		const cacheEntry = authDataCache.get<T>(stableCacheKey);
		isPending = sessionPending || (cacheEntry?.data === undefined && !error);
	});

	// Cleanup
	$effect(() => {
		return () => {
			unsubscribe();
		};
	});

	return {
		get data() {
			return data;
		},
		get isPending() {
			return isPending;
		},
		get isRefetching() {
			return isRefetching;
		},
		get error() {
			return error;
		},
		refetch
	};
}

// Utility function to get localized error messages
function getLocalizedError({
	error,
	localization
}: {
	error: BetterFetchError;
	localization: any;
}) {
	// This should match the logic from the React version
	// For now, return a simple message
	return error.message || localization.ERROR_UNKNOWN || 'An error occurred';
}
