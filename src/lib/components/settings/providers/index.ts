import type { ComponentProps } from 'svelte';
import ProvidersCardComponent from './providers-card.svelte';

export { default as ProviderCell } from './provider-cell.svelte';
export { default as ProvidersCard } from './providers-card.svelte';

export type ProvidersCardProps = ComponentProps<typeof ProvidersCardComponent>;
