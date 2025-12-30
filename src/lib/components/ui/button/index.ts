import Root from './button.svelte';

// TypeScript doesn't recognize module-level exports from .svelte files, so we suppress the error
// @ts-expect-error - TS2614: Module has no exported member
export {
	buttonVariants,
	type ButtonProps,
	type ButtonSize,
	type ButtonVariant
} from './button.svelte';

export {
	Root,
	//
	Root as Button
};
