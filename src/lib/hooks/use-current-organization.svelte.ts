import type { Organization } from 'better-auth/plugins/organization';
import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';

/**
 * Hook that returns the current organization based on the path mode
 */
export function useCurrentOrganization({ slug: slugProp }: { slug?: string } = {}) {
	const config = getAuthUIConfig();
	const organizationOptions = config.organization;
	const { useActiveOrganization, useListOrganizations } = config.hooks;

	const { pathMode, slug: contextSlug } = organizationOptions || {};

	const organizationsResult = useListOrganizations();
	const activeOrgResult = useActiveOrganization();

	// Derive all reactive state based on pathMode
	const data = $derived.by(() => {
		if (pathMode === 'slug') {
			const slug = slugProp || contextSlug;
			return organizationsResult.data?.find((organization: Organization) => organization.slug === slug);
		} else {
			return activeOrgResult.data;
		}
	});

	const isPending = $derived(
		pathMode === 'slug' ? organizationsResult.isPending : activeOrgResult.isPending
	);

	const isRefetching = $derived(
		pathMode === 'slug' ? organizationsResult.isRefetching : activeOrgResult.isRefetching
	);

	const refetch = $derived(
		pathMode === 'slug' ? undefined : activeOrgResult.refetch
	);

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
		get refetch() {
			return refetch;
		}
	};
}
