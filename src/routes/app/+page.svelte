<script lang="ts">
	import { authViewPaths } from '$lib/index.js';
	import type { PageProps } from '../$types.js';
	import { AccountsCard } from '$lib/index.js';

	let { data }: PageProps = $props();
</script>

<AccountsCard />
