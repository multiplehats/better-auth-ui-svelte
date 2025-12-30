/**
 * Toast function type that matches svelte-sonner's API
 */
export interface RenderToast {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(message: string, data?: any): string | number | void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	success(message: string, data?: any): string | number | void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error(message: string, data?: any): string | number | void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	warning(message: string, data?: any): string | number | void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	info(message: string, data?: any): string | number | void;
}
