import type { ComponentProps } from 'svelte';
import AccountViewComponent from './account-view.svelte';

export { default as AccountView } from './account-view.svelte';

export type AccountViewProps = ComponentProps<typeof AccountViewComponent>;
