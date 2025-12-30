<script lang="ts">
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte.js';
	import type { AuthLocalization, User } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';
	import SettingsCard from '../shared/settings-card.svelte';
	import TwoFactorPasswordDialog from './two-factor-password-dialog.svelte';

	export interface TwoFactorCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		localization?: Partial<AuthLocalization>;
	}

	type Props = TwoFactorCardProps;

	let { className, classNames, localization: propLocalization }: Props = $props();

	const contextLocalization = getLocalization();
	const {
		hooks: { useSession }
	} = getAuthUIConfig();

	const mergedLocalization = { ...contextLocalization, ...propLocalization };

	let showPasswordDialog = $state(false);

	const sessionResult = useSession() as ReturnType<typeof useSession> & {
		subscribe: (fn: (value: unknown) => void) => () => void;
	};
	const sessionData = $derived($sessionResult);
	const isPending = $derived(
		sessionData && 'isPending' in sessionData ? sessionData.isPending : false
	);
	const isTwoFactorEnabled = $derived(
		sessionData && 'data' in sessionData
			? (sessionData.data?.user as User)?.twoFactorEnabled
			: false
	);
</script>

<div>
	<SettingsCard
		{className}
		{classNames}
		actionLabel={isTwoFactorEnabled
			? mergedLocalization.DISABLE_TWO_FACTOR
			: mergedLocalization.ENABLE_TWO_FACTOR}
		description={mergedLocalization.TWO_FACTOR_CARD_DESCRIPTION}
		instructions={isTwoFactorEnabled
			? mergedLocalization.TWO_FACTOR_DISABLE_INSTRUCTIONS
			: mergedLocalization.TWO_FACTOR_ENABLE_INSTRUCTIONS}
		{isPending}
		title={mergedLocalization.TWO_FACTOR}
		action={() => (showPasswordDialog = true)}
	/>

	<TwoFactorPasswordDialog
		{classNames}
		isTwoFactorEnabled={!!isTwoFactorEnabled}
		open={showPasswordDialog}
		onOpenChange={(open) => (showPasswordDialog = open)}
	/>
</div>
