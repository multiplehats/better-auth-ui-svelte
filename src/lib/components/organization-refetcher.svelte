<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { useCurrentOrganization } from '$lib/hooks/use-current-organization.svelte.js';

	const config = getAuthUIConfig();
	const {
		hooks: { useListOrganizations, useSession },
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

	// Refetch organizations when user changes
	let previousUserId = $state<string | undefined>(undefined);

	$effect(() => {
		const currentUserId = sessionData?.user.id;

		// Only refetch if user ID actually changed (not on initial load)
		if (currentUserId && previousUserId && currentUserId !== previousUserId) {
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
