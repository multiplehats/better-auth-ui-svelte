import type { Organization } from 'better-auth/plugins/organization';
import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
import { fromStore } from '$lib/utils/store-to-rune.svelte.js';

/**
 * Hook that returns the current organization based on the path mode.
 * This hook bridges better-auth's nanostores with Svelte 5's rune-based reactivity.
 *
 * IMPORTANT: Must be called during component initialization for proper reactivity.
 *
 * @example
 * ```svelte
 * <script>
 *   const org = useCurrentOrganization({ slug: 'my-org' });
 * </script>
 *
 * {#if org.isPending}
 *   Loading...
 * {:else if org.data}
 *   <h1>{org.data.name}</h1>
 * {/if}
 * ```
 */
export function useCurrentOrganization({ slug: slugProp }: { slug?: string } = {}) {
	const config = getAuthUIConfig();
	const organizationOptions = config.organization;
	const { useActiveOrganization, useListOrganizations } = config.hooks;

	const { pathMode, slug: contextSlug } = organizationOptions || {};

	// Get nanostores and convert them to reactive Svelte 5 values
	const organizationsStore = useListOrganizations();
	const activeOrgStore = useActiveOrganization();

	// Convert nanostores to reactive values
	const organizations = fromStore(organizationsStore);
	const activeOrg = fromStore(activeOrgStore);

	// Derive the current organization based on path mode
	const currentOrg = $derived.by(() => {
		let data: Organization | null | undefined = undefined;
		let isPending = false;
		let isRefetching = false;
		let refetch: (() => void) | undefined = undefined;

		if (pathMode === 'slug') {
			const slug = slugProp || contextSlug;
			const orgsResult = organizations.value;

			data =
				orgsResult && 'data' in orgsResult
					? orgsResult.data?.find((org: Organization) => org.slug === slug) ?? null
					: null;
			isPending = orgsResult && 'isPending' in orgsResult ? orgsResult.isPending : false;
			isRefetching = orgsResult && 'isRefetching' in orgsResult ? orgsResult.isRefetching : false;
		} else {
			const activeResult = activeOrg.value;

			data =
				activeResult && 'data' in activeResult
					? (activeResult.data as Organization | null)
					: null;
			isPending = activeResult && 'isPending' in activeResult ? activeResult.isPending : false;
			isRefetching =
				activeResult && 'isRefetching' in activeResult ? activeResult.isRefetching : false;
			refetch = activeResult && 'refetch' in activeResult ? activeResult.refetch : undefined;
		}

		return { data, isPending, isRefetching, refetch };
	});

	// Return an object with getters that read from the derived value
	// This provides a clean API that's reactive in Svelte 5
	return {
		get data() {
			return currentOrg.data;
		},
		get isPending() {
			return currentOrg.isPending;
		},
		get isRefetching() {
			return currentOrg.isRefetching;
		},
		get refetch() {
			return currentOrg.refetch;
		}
	};
}
