<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import type { User } from '$lib/types/index.js';
	import type { SettingsCardProps } from '../shared/settings-card.svelte';
	import UpdateFieldCard from './update-field-card.svelte';

	interface Props extends SettingsCardProps {}

	let { className, classNames, localization: propLocalization, ...props }: Props = $props();

	const {
		hooks: { useSession },
		localization: contextLocalization
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...propLocalization };

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
	const value = $derived(
		(sessionData?.user as User)?.displayUsername || (sessionData?.user as User)?.username
	);
</script>

<UpdateFieldCard
	{className}
	{classNames}
	{value}
	description={mergedLocalization.USERNAME_DESCRIPTION}
	name="username"
	instructions={mergedLocalization.USERNAME_INSTRUCTIONS}
	label={mergedLocalization.USERNAME}
	localization={mergedLocalization}
	placeholder={mergedLocalization.USERNAME_PLACEHOLDER}
	required
	{...props}
/>
