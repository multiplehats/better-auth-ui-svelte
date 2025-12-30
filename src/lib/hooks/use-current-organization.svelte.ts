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

	const organizationsStore = useListOrganizations();
	const activeOrgStore = useActiveOrganization();

	const organizations = fromStore(organizationsStore);
	const activeOrg = fromStore(activeOrgStore);

	const currentOrg = $derived.by(() => {
		let data: Organization | null | undefined = undefined;
		let isPending = false;
		let isRefetching = false;
		let refetch: (() => void) | undefined = undefined;

		if (pathMode === 'slug') {
			const slug = slugProp || contextSlug;
			const orgsResult = organizations.value;

			if (orgsResult && typeof orgsResult === 'object' && 'data' in orgsResult) {
				const orgsData = orgsResult.data;
				data = Array.isArray(orgsData)
					? (orgsData.find((org: Organization) => org.slug === slug) ?? null)
					: null;
				isPending = 'isPending' in orgsResult ? (orgsResult.isPending as boolean) : false;
				isRefetching = 'isRefetching' in orgsResult ? (orgsResult.isRefetching as boolean) : false;
			} else {
				data = null;
				isPending = false;
				isRefetching = false;
			}
		} else {
			const activeResult = activeOrg.value;

			data =
				activeResult && typeof activeResult === 'object' && 'data' in activeResult
					? (activeResult.data as Organization | null)
					: null;
			isPending =
				activeResult && typeof activeResult === 'object' && 'isPending' in activeResult
					? (activeResult.isPending as boolean)
					: false;
			isRefetching =
				activeResult && typeof activeResult === 'object' && 'isRefetching' in activeResult
					? (activeResult.isRefetching as boolean)
					: false;
			refetch =
				activeResult && typeof activeResult === 'object' && 'refetch' in activeResult
					? (activeResult.refetch as (() => void) | undefined)
					: undefined;
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
