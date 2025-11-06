import type { Snippet } from 'svelte';

export type FieldType = 'string' | 'number' | 'boolean';

export interface AdditionalField {
	description?: Snippet;
	instructions?: Snippet;
	label: Snippet;
	placeholder?: string;
	required?: boolean;
	type: FieldType;
	/**
	 * Render a multi-line textarea for string fields
	 */
	multiline?: boolean;
	validate?: (value: string) => Promise<boolean>;
}

export interface AdditionalFields {
	[key: string]: AdditionalField;
}
