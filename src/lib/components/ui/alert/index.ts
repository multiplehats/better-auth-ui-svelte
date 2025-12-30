import Root from './alert.svelte';
import Description from './alert-description.svelte';
import Title from './alert-title.svelte';

// TypeScript doesn't recognize module-level exports from .svelte files, so we suppress the error
// @ts-expect-error - TS2614: Module has no exported member
export { alertVariants, type AlertVariant } from './alert.svelte';

export {
	Root,
	Description,
	Title,
	//
	Root as Alert,
	Description as AlertDescription,
	Title as AlertTitle
};
