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

	const listOrganizationsResult = useListOrganizations();
	const organizations = $derived('data' in listOrganizationsResult ? listOrganizationsResult.data : undefined);
	const refetchListOrganizations = $derived('refetch' in listOrganizationsResult ? listOrganizationsResult.refetch : undefined);

	// Refetch organizations when user changes
	$effect(() => {
		if (!sessionData?.user.id) return;

		if (organization || organizations) {
			refetchOrganization?.();
			refetchListOrganizations?.();
		}
	});

	// Navigate to personal path if organization slug is not found
	$effect(() => {
		if (organizationRefetching || organizationPending) return;

		if (slug && pathMode === 'slug' && !organization) {
			navigate(personalPath || redirectTo);
		}
	});
</script>
