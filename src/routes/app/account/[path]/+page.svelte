<script lang="ts">
	import type { PageProps } from './$types.js';
	import { AccountView } from '$lib/index.js';
	let { params }: PageProps = $props();
</script>

<AccountView path={params.path} />
