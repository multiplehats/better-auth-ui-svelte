import type { ZodSchema, ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need a generic record type here
export interface CreateFormOptions<T extends Record<string, any>> {
	schema: ZodSchema<T>;
	initialValues: T;
	onSubmit: (values: T) => Promise<void> | void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need a generic record type here
export interface FormReturn<T extends Record<string, any>> {
	data: T;
	errors: Partial<Record<keyof T, string[]>>;
	isSubmitting: boolean;
	submitError: string | null;
	handleSubmit: (e?: SubmitEvent) => Promise<void>;
	validate: () => boolean;
	reset: () => void;
	setError: (field: keyof T, message: string) => void;
}

/**
 * Create a form with validation and submission handling
 * This utility works in both Svelte SPAs and SvelteKit
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- we need a generic record type here
export function createForm<T extends Record<string, any>>(
	options: CreateFormOptions<T>
): FormReturn<T> {
	// Create a state object that holds all form state
	// This ensures all properties are reactive and properly tracked
	const state = $state({
		data: structuredClone(options.initialValues) as T,
		errors: {} as Partial<Record<keyof T, string[]>>,
		isSubmitting: false,
		submitError: null as string | null
	});

	function validate(): boolean {
		try {
			options.schema.parse(state.data);
			state.errors = {};
			return true;
		} catch (error) {
			if (error && typeof error === 'object' && 'flatten' in error) {
				const zodError = error as ZodError;
				state.errors = zodError.flatten().fieldErrors as Partial<Record<keyof T, string[]>>;
			}
			return false;
		}
	}

	async function handleSubmit(e?: SubmitEvent) {
		e?.preventDefault();

		if (!validate()) return;

		state.isSubmitting = true;
		state.submitError = null;

		try {
			await options.onSubmit(state.data);
		} catch (error) {
			state.submitError = error instanceof Error ? error.message : 'Submission failed';
			throw error;
		} finally {
			state.isSubmitting = false;
		}
	}

	function reset() {
		state.data = structuredClone(options.initialValues) as T;
		state.errors = {};
		state.isSubmitting = false;
		state.submitError = null;
	}

	function setError(field: keyof T, message: string) {
		if (!state.errors[field]) {
			state.errors[field] = [];
		}
		state.errors[field]?.push(message);
	}

	// Return an object that exposes the reactive state
	// Using a single $state object ensures proper reactivity tracking
	return {
		get data() {
			return state.data;
		},
		set data(value: T) {
			state.data = value;
		},
		get errors() {
			return state.errors;
		},
		get isSubmitting() {
			return state.isSubmitting;
		},
		get submitError() {
			return state.submitError;
		},
		handleSubmit,
		validate,
		setError,
		reset
	};
}
