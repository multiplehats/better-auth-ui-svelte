<script lang="ts">
	import { z } from 'zod';
	import Loader2 from '@lucide/svelte/icons/loader';
	import { createForm } from '$lib/utils/form.svelte';
	import {
		getAuthClient,
		getLocalization,
		getAuthUIConfig
	} from '$lib/context/auth-ui-config.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { getLocalizedError } from '$lib/utils/utils.js';
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
	const localization = { ...contextLocalization, ...localizationProp };

	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo
	});

	const schema = z.object({
		code: z.string().min(1, { error: localization.BACKUP_CODE_REQUIRED })
	});

	const form = createForm({
		schema,
		initialValues: {
			code: ''
		},
		onSubmit: async (values) => {
			try {
				await authClient.twoFactor.verifyBackupCode({
					code: values.code,
					fetchOptions: { throw: true }
				});

				await onSuccess();
			} catch (error) {
				config.toast({
					variant: 'error',
					message: getLocalizedError({ error, localization })
				});

				form.reset();
				throw error;
			}
		}
	});

	// Compute final isSubmitting state
	const isSubmitting = $derived(
		isSubmittingProp ?? (form.isSubmitting || transitionPending)
	);

	// Sync isSubmitting state
	$effect(() => {
		setIsSubmitting?.(form.isSubmitting || transitionPending);
	});
</script>

<form onsubmit={form.handleSubmit} class={cn('grid gap-6', className, classNames?.base)}>
	<div>
		<Label for="code" class={classNames?.label}>
			{localization.BACKUP_CODE}
		</Label>

		<Input
			id="code"
			type="text"
			autocomplete="off"
			placeholder={localization.BACKUP_CODE_PLACEHOLDER}
			bind:value={form.data.code}
			disabled={isSubmitting}
			class={classNames?.input}
		/>

		{#if form.errors.code}
			<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
				{form.errors.code[0]}
			</p>
		{/if}
	</div>

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
