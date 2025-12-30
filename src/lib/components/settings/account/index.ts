import type { ComponentProps } from 'svelte';
import AccountSettingsCardsComponent from './account-settings-cards.svelte';
import AccountsCardComponent from './accounts-card.svelte';
import DeleteAccountCardComponent from './delete-account-card.svelte';
import UpdateAvatarCardComponent from './update-avatar-card.svelte';
import UpdateFieldCardComponent from './update-field-card.svelte';

export { default as AccountSettingsCards } from './account-settings-cards.svelte';
export { default as AccountsCard } from './accounts-card.svelte';
export { default as AccountCell } from './account-cell.svelte';
export { default as DeleteAccountCard } from './delete-account-card.svelte';
export { default as DeleteAccountDialog } from './delete-account-dialog.svelte';
export { default as UpdateAvatarCard } from './update-avatar-card.svelte';
export { default as UpdateFieldCard } from './update-field-card.svelte';
export { default as UpdateNameCard } from './update-name-card.svelte';
export { default as UpdateUsernameCard } from './update-username-card.svelte';

export type AccountSettingsCardsProps = ComponentProps<typeof AccountSettingsCardsComponent>;
export type AccountsCardProps = ComponentProps<typeof AccountsCardComponent>;
export type DeleteAccountCardProps = ComponentProps<typeof DeleteAccountCardComponent>;
export type UpdateAvatarCardProps = ComponentProps<typeof UpdateAvatarCardComponent>;
export type UpdateFieldCardProps = ComponentProps<typeof UpdateFieldCardComponent>;
