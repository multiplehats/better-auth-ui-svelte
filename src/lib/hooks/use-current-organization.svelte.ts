import type { Organization } from 'better-auth/plugins/organization';
import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
import { computed } from 'nanostores';

/**
 * Hook that returns the current organization based on the path mode
 * Returns a nanostore that can be subscribed to with $ in .svelte files
 */
export function useCurrentOrganization({ slug: slugProp }: { slug?: string } = {}) {
	const config = getAuthUIConfig();
	const organizationOptions = config.organization;
	const { useActiveOrganization, useListOrganizations } = config.hooks;

	const { pathMode, slug: contextSlug } = organizationOptions || {};

	// Get nanostores - these are already reactive
	const organizationsStore = useListOrganizations();
	const activeOrgStore = useActiveOrganization();

	// Create a computed store that derives the current organization
	const currentOrgStore = computed(
		[organizationsStore, activeOrgStore],
		(organizationsResult: any, activeOrgResult: any) => {
			let data: Organization | undefined = undefined;
			let isPending = false;
			let isRefetching = false;
			let refetch: (() => void) | undefined = undefined;

			if (pathMode === 'slug') {
				const slug = slugProp || contextSlug;
				data =
					organizationsResult && 'data' in organizationsResult
						? organizationsResult.data?.find((org: Organization) => org.slug === slug)
						: undefined;
				isPending =
					organizationsResult && 'isPending' in organizationsResult
						? organizationsResult.isPending
						: false;
				isRefetching =
					organizationsResult && 'isRefetching' in organizationsResult
						? organizationsResult.isRefetching
						: false;
			} else {
				data = activeOrgResult && 'data' in activeOrgResult ? activeOrgResult.data : undefined;
				isPending =
					activeOrgResult && 'isPending' in activeOrgResult ? activeOrgResult.isPending : false;
				isRefetching =
					activeOrgResult && 'isRefetching' in activeOrgResult
						? activeOrgResult.isRefetching
						: false;
				refetch =
					activeOrgResult && 'refetch' in activeOrgResult ? activeOrgResult.refetch : undefined;
			}

			return { data, isPending, isRefetching, refetch };
		}
	);

	// Return an object with getters that read from the computed store
	// This allows usage like: const org = useCurrentOrganization(); org.data
	return {
		get data() {
			return currentOrgStore.get().data;
		},
		get isPending() {
			return currentOrgStore.get().isPending;
		},
		get isRefetching() {
			return currentOrgStore.get().isRefetching;
		},
		get refetch() {
			return currentOrgStore.get().refetch;
		}
	};
}
