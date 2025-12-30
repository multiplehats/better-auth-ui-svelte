import type { ComponentProps } from 'svelte';
import SettingsCardComponent from './settings-card.svelte';
import SessionFreshnessDialogComponent from './session-freshness-dialog.svelte';

export { default as SettingsCard } from './settings-card.svelte';
export { default as SettingsCardHeader } from './settings-card-header.svelte';
export { default as SettingsCardFooter } from './settings-card-footer.svelte';
export { default as SettingsActionButton } from './settings-action-button.svelte';
export { default as SessionFreshnessDialog } from './session-freshness-dialog.svelte';

export type SettingsCardProps = ComponentProps<typeof SettingsCardComponent>;
export type SettingsCardClassNames = SettingsCardProps['classNames'];
export type SessionFreshnessDialogProps = ComponentProps<typeof SessionFreshnessDialogComponent>;
