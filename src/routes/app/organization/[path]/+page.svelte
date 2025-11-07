<script lang="ts">
	import type { PageProps } from './$types.js';
	import { OrganizationView } from '$lib/index.js';

	let { data, params }: PageProps = $props();
</script>

<OrganizationView path={params.path} />
