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

	let data: Organization | null | undefined;
	let isPending: boolean | undefined;
	let isRefetching: boolean | undefined;
	let refetch: (() => void) | undefined;

	const organizationsResult = useListOrganizations();
	const { data: organizations, isPending: organizationsPending, isRefetching: organizationsRefetching } = $derived(organizationsResult);

	if (pathMode === 'slug') {
		const slug = slugProp || contextSlug;
		data = $derived(organizations?.find((organization: Organization) => organization.slug === slug));
		isPending = organizationsPending;
		isRefetching = organizationsRefetching;
	} else {
		const activeOrgResult = useActiveOrganization();
		const {
			data: activeOrganization,
			isPending: organizationPending,
			isRefetching: organizationRefetching,
			refetch: refetchOrganization
		} = $derived(activeOrgResult);

		refetch = refetchOrganization;
		data = activeOrganization;
		isPending = organizationPending;
		isRefetching = organizationRefetching;
	}

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
