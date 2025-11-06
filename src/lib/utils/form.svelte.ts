import type { ZodSchema, ZodError } from 'zod';

export interface CreateFormOptions<T extends Record<string, any>> {
	schema: ZodSchema<T>;
	initialValues: T;
	onSubmit: (values: T) => Promise<void> | void;
}

export interface FormReturn<T extends Record<string, any>> {
	data: T;
	errors: Partial<Record<keyof T, string[]>>;
	isSubmitting: boolean;
	submitError: string | null;
	handleSubmit: (e?: SubmitEvent) => Promise<void>;
	validate: () => boolean;
	reset: () => void;
}

/**
 * Create a form with validation and submission handling
 * This utility works in both Svelte SPAs and SvelteKit
 */
export function createForm<T extends Record<string, any>>(
	options: CreateFormOptions<T>
): FormReturn<T> {
	let data = $state<T>(structuredClone(options.initialValues));
	let errors = $state<Partial<Record<keyof T, string[]>>>({});
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);

	function validate(): boolean {
		try {
			options.schema.parse(data);
			errors = {};
			return true;
		} catch (error) {
			if (error && typeof error === 'object' && 'flatten' in error) {
				const zodError = error as ZodError;
				errors = zodError.flatten().fieldErrors as Partial<Record<keyof T, string[]>>;
			}
			return false;
		}
	}

	async function handleSubmit(e?: SubmitEvent) {
		e?.preventDefault();

		if (!validate()) return;

		isSubmitting = true;
		submitError = null;

		try {
			await options.onSubmit(data);
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Submission failed';
			throw error;
		} finally {
			isSubmitting = false;
		}
	}

	function reset() {
		data = structuredClone(options.initialValues);
		errors = {};
		isSubmitting = false;
		submitError = null;
	}

	return {
		get data() {
			return data;
		},
		set data(value: T) {
			data = value;
		},
		get errors() {
			return errors;
		},
		get isSubmitting() {
			return isSubmitting;
		},
		get submitError() {
			return submitError;
		},
		handleSubmit,
		validate,
		reset
	};
}
