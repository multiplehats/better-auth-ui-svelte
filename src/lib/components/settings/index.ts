import type { ComponentProps } from 'svelte';
import SecuritySettingsCardsComponent from './security-settings-cards.svelte';

export * from './shared/index.js';
export * from './account/index.js';
export * from './security/index.js';
export * from './providers/index.js';
export * from './two-factor/index.js';
export * from './passkey/index.js';
export * from './api-key/index.js';

export { default as SecuritySettingsCards } from './security-settings-cards.svelte';
export type SecuritySettingsCardsProps = ComponentProps<typeof SecuritySettingsCardsComponent>;
