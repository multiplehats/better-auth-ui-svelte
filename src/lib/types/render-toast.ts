/**
 * Toast function type that matches svelte-sonner's API
 */
export interface RenderToast {
	(message: string, data?: any): string | number | void;
	success(message: string, data?: any): string | number | void;
	error(message: string, data?: any): string | number | void;
	warning(message: string, data?: any): string | number | void;
	info(message: string, data?: any): string | number | void;
}
