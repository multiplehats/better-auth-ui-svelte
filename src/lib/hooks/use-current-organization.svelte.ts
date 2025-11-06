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
			return 'data' in organizationsResult ? organizationsResult.data?.find((organization: Organization) => organization.slug === slug) : undefined;
		} else {
			return 'data' in activeOrgResult ? activeOrgResult.data : undefined;
		}
	});

	const isPending = $derived(
		pathMode === 'slug'
			? ('isPending' in organizationsResult ? organizationsResult.isPending : false)
			: ('isPending' in activeOrgResult ? activeOrgResult.isPending : false)
	);

	const isRefetching = $derived(
		pathMode === 'slug'
			? ('isRefetching' in organizationsResult ? organizationsResult.isRefetching : false)
			: ('isRefetching' in activeOrgResult ? activeOrgResult.isRefetching : false)
	);

	const refetch = $derived(
		pathMode === 'slug' ? undefined : ('refetch' in activeOrgResult ? activeOrgResult.refetch : undefined)
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
