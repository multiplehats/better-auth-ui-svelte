import type { ComponentProps } from 'svelte';
import PasskeyCellComponent from './passkey-cell.svelte';
import PasskeysCardComponent from './passkeys-card.svelte';

export { default as PasskeyCell } from './passkey-cell.svelte';
export { default as PasskeysCard } from './passkeys-card.svelte';

export type PasskeyCellProps = ComponentProps<typeof PasskeyCellComponent>;
export type PasskeysCardProps = ComponentProps<typeof PasskeysCardComponent>;
