<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthViewPath } from '$lib/types';
	import type { AuthViewClassNames } from './auth-view.svelte';

	interface Props {
		classNames?: AuthViewClassNames;
		isSubmitting?: boolean;
		view: AuthViewPath;
	}

	let { classNames, isSubmitting, view }: Props = $props();

	const config = getAuthUIConfig();
	const loc = getLocalization();

	const { viewPaths, navigate, basePath, credentials } = config;

	function handleClick() {
		const targetPath =
			view === 'MAGIC_LINK' || !credentials
				? viewPaths.SIGN_IN
				: viewPaths.MAGIC_LINK;

		navigate(`${basePath}/${targetPath}${window.location.search}`);
	}
</script>

<Button
	class={cn('w-full', classNames?.form?.button, classNames?.form?.secondaryButton)}
	disabled={isSubmitting}
	type="button"
	variant="secondary"
	onclick={handleClick}
>
	{#if view === 'MAGIC_LINK'}
		<Lock class={classNames?.form?.icon} />
	{:else}
		<Mail class={classNames?.form?.icon} />
	{/if}
	{loc.SIGN_IN_WITH}{' '}
	{view === 'MAGIC_LINK' ? loc.PASSWORD : loc.MAGIC_LINK}
</Button>
