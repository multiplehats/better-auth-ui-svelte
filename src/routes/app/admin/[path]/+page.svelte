<script lang="ts">
	import type { PageProps } from './$types.js';
	import { AdminView } from '$lib/index.js';

	let { params }: PageProps = $props();
</script>

<AdminView path={params.path} />
