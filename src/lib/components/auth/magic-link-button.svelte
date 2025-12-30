<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthViewClassNames } from './auth-view.svelte';
	import type { AuthViewPath } from '$lib/utils/view-paths.js';
	import type { AuthLocalization } from '$lib/localization/auth-localization.js';

	interface Props {
		classNames?: AuthViewClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		view: AuthViewPath;
	}

	let { classNames, isSubmitting, localization: localizationProp, view }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	const { viewPaths, navigate, basePath, credentials } = config;

	// Merge context localization with prop localization (prop takes precedence)
	const localization = $derived({ ...contextLocalization, ...localizationProp });

	function handleClick() {
		const targetPath =
			view === 'MAGIC_LINK' || !credentials ? viewPaths.SIGN_IN : viewPaths.MAGIC_LINK;

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
	{localization.SIGN_IN_WITH}
	{view === 'MAGIC_LINK' ? localization.PASSWORD : localization.MAGIC_LINK}
</Button>
