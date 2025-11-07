<script lang="ts">
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import { cn } from '$lib/utils/utils.js';
	import type { AuthFormClassNames } from './auth/auth-form.svelte';
	import Alert from './ui/alert/alert.svelte';
	import AlertTitle from './ui/alert/alert-title.svelte';
	import AlertDescription from './ui/alert/alert-description.svelte';

	export interface FormErrorProps {
		/**
		 * Optional form instance from @tanstack/svelte-form
		 * Used to access form-level errors from form state
		 */
		form?: {
			state: {
				errorMap?: Record<string, unknown>;
			};
		};
		/**
		 * Optional error message to display directly
		 * If provided, this takes precedence over form errors
		 */
		message?: string | null;
		/**
		 * Optional title for the error alert
		 * @default "Error"
		 */
		title?: string;
		/**
		 * Optional class names for styling
		 */
		classNames?: AuthFormClassNames;
	}

	let { form, message, title, classNames }: FormErrorProps = $props();

	// Determine error message from props or form state
	// Priority: message prop > form.state.errorMap
	const errorMessage = $derived(
		message ||
			(form?.state.errorMap?.onSubmit
				? String(form.state.errorMap.onSubmit)
				: form?.state.errorMap?.root
					? String(form.state.errorMap.root)
					: null)
	);
</script>

{#if errorMessage}
	<Alert variant="destructive" class={cn(classNames?.error)}>
		<AlertCircle class="self-center" />
		<AlertTitle>{title || 'Error'}</AlertTitle>
		<AlertDescription>{errorMessage}</AlertDescription>
	</Alert>
{/if}
