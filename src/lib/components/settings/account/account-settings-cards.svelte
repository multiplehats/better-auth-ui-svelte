<script lang="ts" module>
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { SettingsCardClassNames } from '../shared/settings-card.svelte';

	export interface AccountSettingsCardsProps {
		className?: string;
		classNames?: {
			card?: SettingsCardClassNames;
			cards?: string;
		};
		localization?: Partial<AuthLocalization>;
	}
</script>

<script lang="ts">
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn } from '$lib/utils/ui.js';
	import AccountsCard from './accounts-card.svelte';
	import UpdateAvatarCard from './update-avatar-card.svelte';
	import UpdateFieldCard from './update-field-card.svelte';
	import UpdateNameCard from './update-name-card.svelte';
	import UpdateUsernameCard from './update-username-card.svelte';
	// TODO: Import ChangeEmailCard when security directory is ported
	// import ChangeEmailCard from '../security/change-email-card.svelte';

	type Props = AccountSettingsCardsProps;

	let { className, classNames, localization }: Props = $props();

	const {
		additionalFields,
		avatar,
		credentials,
		hooks: { useSession },
		multiSession,
		account: accountOptions
	} = getAuthUIConfig();

	const sessionStore = useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);
</script>

<div class={cn('flex w-full flex-col gap-4 md:gap-6', className, classNames?.cards)}>
	{#if accountOptions?.fields?.includes('image') && avatar}
		<UpdateAvatarCard classNames={classNames?.card} {localization} />
	{/if}

	{#if credentials?.username}
		<UpdateUsernameCard classNames={classNames?.card} {localization} />
	{/if}

	{#if accountOptions?.fields?.includes('name')}
		<UpdateNameCard classNames={classNames?.card} {localization} />
	{/if}

	<!-- TODO: Uncomment when ChangeEmailCard is ported -->
	<!-- {#if changeEmail}
		<ChangeEmailCard classNames={classNames?.card} {localization} />
	{/if} -->

	{#if accountOptions?.fields}
		{#each accountOptions.fields as field (field)}
			{#if field !== 'image' && field !== 'name'}
				{@const additionalField = additionalFields?.[field]}
				{#if additionalField}
					<!-- Custom fields are not typed in the session user object -->
					{@const defaultValue = sessionData?.user[
						field as keyof typeof sessionData.user
					] as unknown}
					<UpdateFieldCard
						classNames={classNames?.card}
						value={defaultValue}
						description={additionalField.description}
						name={field}
						instructions={additionalField.instructions}
						label={additionalField.label}
						{localization}
						placeholder={additionalField.placeholder}
						required={additionalField.required}
						type={additionalField.type}
						multiline={additionalField.multiline}
						validate={additionalField.validate}
					/>
				{/if}
			{/if}
		{/each}
	{/if}

	{#if multiSession}
		<AccountsCard classNames={classNames?.card} {localization} />
	{/if}
</div>
