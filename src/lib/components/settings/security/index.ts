import type { ComponentProps } from 'svelte';
import ChangeEmailCardComponent from './change-email-card.svelte';
import ChangePasswordCardComponent from './change-password-card.svelte';
import SessionCellComponent from './session-cell.svelte';
import SessionsCardComponent from './sessions-card.svelte';

export { default as ChangeEmailCard } from './change-email-card.svelte';
export { default as ChangePasswordCard } from './change-password-card.svelte';
export { default as SessionCell } from './session-cell.svelte';
export { default as SessionsCard } from './sessions-card.svelte';

export type ChangeEmailCardProps = ComponentProps<typeof ChangeEmailCardComponent>;
export type ChangePasswordCardProps = ComponentProps<typeof ChangePasswordCardComponent>;
export type SessionCellProps = ComponentProps<typeof SessionCellComponent>;
export type SessionsCardProps = ComponentProps<typeof SessionsCardComponent>;
