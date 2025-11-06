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

	const organizationsStore = useListOrganizations();
	const activeOrgStore = useActiveOrganization();

	// Create reactive state to hold store values
	let organizationsResult = $state<ReturnType<typeof useListOrganizations>>();
	let activeOrgResult = $state<ReturnType<typeof useActiveOrganization>>();

	// Subscribe to stores and update state
	organizationsStore?.subscribe?.((value) => {
		organizationsResult = value;
	});

	activeOrgStore?.subscribe?.((value) => {
		activeOrgResult = value;
	});

	// Derive all reactive state based on pathMode
	const data = $derived.by(() => {
		if (pathMode === 'slug') {
			const slug = slugProp || contextSlug;
			return organizationsResult && 'data' in organizationsResult
				? organizationsResult.data?.find((organization: Organization) => organization.slug === slug)
				: undefined;
		} else {
			return activeOrgResult && 'data' in activeOrgResult ? activeOrgResult.data : undefined;
		}
	});

	const isPending = $derived(
		pathMode === 'slug'
			? organizationsResult && 'isPending' in organizationsResult
				? organizationsResult.isPending
				: false
			: activeOrgResult && 'isPending' in activeOrgResult
				? activeOrgResult.isPending
				: false
	);

	const isRefetching = $derived(
		pathMode === 'slug'
			? organizationsResult && 'isRefetching' in organizationsResult
				? organizationsResult.isRefetching
				: false
			: activeOrgResult && 'isRefetching' in activeOrgResult
				? activeOrgResult.isRefetching
				: false
	);

	const refetch = $derived(
		pathMode === 'slug'
			? undefined
			: activeOrgResult && 'refetch' in activeOrgResult
				? activeOrgResult.refetch
				: undefined
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
