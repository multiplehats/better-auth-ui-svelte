import type { ZodSchema, ZodError, z } from 'zod';

export interface CreateFormOptions<TSchema extends ZodSchema> {
	schema: TSchema;
	initialValues: z.infer<TSchema>;
	onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
}

export interface FormReturn<TSchema extends ZodSchema> {
	data: z.infer<TSchema>;
	errors: Partial<Record<keyof z.infer<TSchema>, string[]>>;
	isSubmitting: boolean;
	submitError: string | null;
	handleSubmit: (e?: SubmitEvent) => Promise<void>;
	validate: () => boolean;
	reset: () => void;
	setError: (field: keyof z.infer<TSchema>, message: string) => void;
}

/**
 * Create a form with validation and submission handling
 * This utility works in both Svelte SPAs and SvelteKit
 */
export function createForm<TSchema extends ZodSchema>(
	options: CreateFormOptions<TSchema>
): FormReturn<TSchema> {
	// Create a state object that holds all form state
	// This ensures all properties are reactive and properly tracked
	const state = $state({
		data: structuredClone(options.initialValues) as z.infer<TSchema>,
		errors: {} as Partial<Record<keyof z.infer<TSchema>, string[]>>,
		isSubmitting: false,
		submitError: null as string | null
	});

	function validate(): boolean {
		try {
			// Access schema reactively to support $derived schemas
			const schema = options.schema;
			schema.parse(state.data);
			state.errors = {};
			return true;
		} catch (error) {
			if (error && typeof error === 'object' && 'issues' in error) {
				const zodError = error as ZodError;
				const fieldErrors: Partial<Record<keyof z.infer<TSchema>, string[]>> = {};

				// Build field errors from issues array
				zodError.issues.forEach((issue) => {
					const path = issue.path[0] as keyof z.infer<TSchema>;
					if (path) {
						if (!fieldErrors[path]) {
							fieldErrors[path] = [];
						}
						fieldErrors[path]!.push(issue.message);
					}
				});

				state.errors = fieldErrors;
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
		state.data = structuredClone(options.initialValues) as z.infer<TSchema>;
		state.errors = {};
		state.isSubmitting = false;
		state.submitError = null;
	}

	function setError(field: keyof z.infer<TSchema>, message: string) {
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
		set data(value: z.infer<TSchema>) {
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
