<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthViewPath, AuthLocalization } from '$lib/types';
	import type { AuthViewClassNames } from './auth-view.svelte';

	interface Props {
		classNames?: AuthViewClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		view: AuthViewPath;
	}

	let { classNames, isSubmitting, localization: localizationProp, view }: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();

	// Merge context localization with prop localization (prop takes precedence)
	const localization = $derived({ ...contextLocalization, ...localizationProp });

	function handleClick() {
		const targetView = view === 'EMAIL_OTP' ? config.viewPaths.SIGN_IN : config.viewPaths.EMAIL_OTP;
		config.navigate(`${config.basePath}/${targetView}${window.location.search}`);
	}
</script>

<Button
	class={cn('w-full', classNames?.form?.button, classNames?.form?.secondaryButton)}
	disabled={isSubmitting}
	type="button"
	variant="secondary"
	onclick={handleClick}
>
	{#if view === 'EMAIL_OTP'}
		<Lock class={classNames?.form?.icon} />
	{:else}
		<Mail class={classNames?.form?.icon} />
	{/if}
	{localization.SIGN_IN_WITH}
	{view === 'EMAIL_OTP' ? localization.PASSWORD : localization.EMAIL_OTP}
</Button>
