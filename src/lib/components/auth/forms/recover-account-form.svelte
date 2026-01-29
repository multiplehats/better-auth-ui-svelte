<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import Loader2 from '@lucide/svelte/icons/loader';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getLocalizedError, getFieldError } from '$lib/utils/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils/ui.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
	}

	let {
		className,
		classNames,
		isSubmitting: isSubmittingProp,
		localization: localizationProp,
		redirectTo,
		setIsSubmitting
	}: Props = $props();

	const authClient = getAuthClient();
	const contextLocalization = getLocalization();
	const config = getAuthUIConfig();

	// Merge localization from context and props
	// svelte-ignore state_referenced_locally -- form schema intentionally captures initial localization
	const localization = { ...contextLocalization, ...localizationProp };

	// svelte-ignore state_referenced_locally -- redirect value is captured once for transition hook
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo
	});

	const schema = z.object({
		code: z.string().min(1, { message: localization.BACKUP_CODE_REQUIRED })
	});

	const form = createForm(() => ({
		defaultValues: {
			code: ''
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.twoFactor.verifyBackupCode({
					code: value.code,
					fetchOptions: { throw: true }
				});

				await onSuccess();
			} catch (error) {
				config.toast.error(getLocalizedError({ error, localization }));

				form.reset();
				throw error;
			}
		}
	}));

	// Compute final isSubmitting state
	const isSubmitting = $derived(isSubmittingProp ?? (form.state.isSubmitting || transitionPending));

	// Sync isSubmitting state
	$effect(() => {
		setIsSubmitting?.(form.state.isSubmitting || transitionPending);
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
	class={cn('grid gap-6', className, classNames?.base)}
>
	<form.Field name="code" validators={{ onChange: schema.shape.code }}>
		{#snippet children(field)}
			<div>
				<Label for="code" class={classNames?.label}>
					{localization.BACKUP_CODE}
				</Label>

				<Input
					id="code"
					type="text"
					autocomplete="off"
					placeholder={localization.BACKUP_CODE_PLACEHOLDER}
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
					disabled={isSubmitting}
					class={classNames?.input}
				/>

				{#if field.state.meta.errors.length > 0}
					<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<Button
		type="submit"
		disabled={isSubmitting}
		class={cn(classNames?.button, classNames?.primaryButton)}
	>
		{#if isSubmitting}
			<Loader2 class="animate-spin" />
		{:else}
			{localization.RECOVER_ACCOUNT_ACTION}
		{/if}
	</Button>
</form>
