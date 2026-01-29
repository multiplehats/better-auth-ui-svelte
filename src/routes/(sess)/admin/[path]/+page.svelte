<script lang="ts">
	import type { PageProps } from './$types.js';
	import { AdminView } from '$lib/index.js';
	import type { AdminTableAction, Organization } from '$lib/types/admin.js';
	import { BarChart } from '@lucide/svelte';

	let { params }: PageProps = $props();

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

<AdminView path={params.path} {organizationCustomActions} />
