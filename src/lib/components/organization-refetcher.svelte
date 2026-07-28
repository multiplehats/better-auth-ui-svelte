<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';

	const config = getAuthUIConfig();
	const {
		hooks: { useListOrganizations, useSession, useActiveOrganization },
		organization: organizationOptions,
		navigate,
		redirectTo
	} = config;

	const { slug, pathMode, personalPath } = organizationOptions || {};

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);

	const organizationResult = useCurrentOrganization();
	const organization = $derived(organizationResult.data);
	const organizationPending = $derived(organizationResult.isPending);
	const organizationRefetching = $derived(organizationResult.isRefetching);
	const refetchOrganization = $derived(organizationResult.refetch);

	const listOrganizationsStore = useListOrganizations() as ReturnType<
		typeof useListOrganizations
	> & { subscribe: () => void };
	const listOrganizationsResult = $derived($listOrganizationsStore);
	const refetchListOrganizations = $derived(
		listOrganizationsResult && 'refetch' in listOrganizationsResult
			? listOrganizationsResult.refetch
			: undefined
	);

	// Refetch organizations when user changes.
	// Uses $effect.pre so the stale org is cleared BEFORE the org
	// sub-components' $effect hooks (e.g. useHasPermission) refire — preventing
	// has-permission calls against the stale org.
	const activeOrgStore = useActiveOrganization?.();
	let previousUserId = $state<string | undefined>(undefined);

	$effect.pre(() => {
		const currentUserId = sessionData?.user?.id;

		// Only act if user ID actually changed (not on initial load)
		if (currentUserId && previousUserId && currentUserId !== previousUserId) {
			// Clear the stale active-org data FIRST so the organization view
			// unmounts its sub-components (whose has-permission hooks would
			// otherwise fire against the stale org and 401). The refetch
			// below then restores the correct org for the new user.
			if (activeOrgStore) {
				const current = activeOrgStore.get();
				activeOrgStore.set?.({
					...current,
					data: null,
					isPending: true
				});
			}
			refetchOrganization?.();
			refetchListOrganizations?.();
		}

		previousUserId = currentUserId;
	});

	// Navigate to personal path if organization slug is not found
	$effect(() => {
		if (organizationRefetching || organizationPending) return;

		if (slug && pathMode === 'slug' && !organization) {
			navigate(personalPath || redirectTo);
		}
	});
</script>
