<script lang="ts">
	import AdminDashboard from '$lib/components/admin/admin-dashboard.svelte';
	import type { AdminTableAction, Organization } from '$lib/types/admin.js';
	import { BarChart } from '@lucide/svelte';

	const organizationCustomActions: AdminTableAction<Organization>[] = [
		{
			label: 'View Analytics',
			icon: BarChart,
			onClick: (org) => {
				alert(`Viewing analytics for ${org.name}`);
			}
		},
		{
			label: 'Archive',
			variant: 'destructive',
			onClick: (org) => {
				alert(`Archiving ${org.name}`);
			},
			show: (org) => org.slug !== 'default'
		}
	];
</script>

<AdminDashboard orgsTableProps={{ customActions: organizationCustomActions }} />
