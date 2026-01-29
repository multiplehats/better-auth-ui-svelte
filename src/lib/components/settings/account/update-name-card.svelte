<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import type { SettingsCardProps } from '../shared/settings-card.svelte';
	import UpdateFieldCard from './update-field-card.svelte';

	type Props = SettingsCardProps;

	let { className, classNames, localization: propLocalization, ...props }: Props = $props();

	const {
		hooks: { useSession },
		localization: contextLocalization,
		nameRequired
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
</script>

<UpdateFieldCard
	{className}
	{classNames}
	value={sessionData?.user.name}
	description={mergedLocalization.NAME_DESCRIPTION}
	name="name"
	instructions={mergedLocalization.NAME_INSTRUCTIONS}
	label={mergedLocalization.NAME}
	localization={mergedLocalization}
	placeholder={mergedLocalization.NAME_PLACEHOLDER}
	required={nameRequired}
	{...props}
/>
