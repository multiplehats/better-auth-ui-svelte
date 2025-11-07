<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { getAuthUIConfig } from '$lib/context/auth-ui-config.svelte';
	import { cn, getLocalizedError } from '$lib/utils/utils.js';
	import type { AuthLocalization, FieldType } from '$lib/types/index.js';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import SettingsCard, { type SettingsCardClassNames } from '../shared/settings-card.svelte';

	export interface UpdateFieldCardProps {
		className?: string;
		classNames?: SettingsCardClassNames;
		description?: Snippet | string;
		instructions?: Snippet | string;
		localization?: Partial<AuthLocalization>;
		name: string;
		placeholder?: string;
		required?: boolean;
		label?: Snippet | string;
		type?: FieldType;
		multiline?: boolean;
		value?: unknown;
		validate?: (value: string) => boolean | Promise<boolean>;
	}

	interface Props extends UpdateFieldCardProps {}

	let {
		className,
		classNames,
		description,
		instructions,
		localization: propLocalization,
		name,
		placeholder,
		required,
		label,
		type,
		multiline,
		value,
		validate
	}: Props = $props();

	const {
		hooks: { useSession },
		mutators: { updateUser },
		localization: contextLocalization,
		optimistic,
		toast,
		onSessionChange
	} = getAuthUIConfig();

	const mergedLocalization = $derived({ ...contextLocalization, ...propLocalization });

	const sessionStore = useSession();
	const isPending = $derived('isPending' in $sessionStore ? $sessionStore.isPending : true);

	// Create the appropriate schema based on type
	let fieldSchema = $derived.by(() => {
		let schema: z.ZodType<unknown> = z.unknown();

		if (type === 'number') {
			schema = required
				? z.preprocess(
						(val) => (!val ? undefined : Number(val)),
						z.number({
							message: `${label} ${mergedLocalization.IS_INVALID}`
						})
					)
				: z.coerce
						.number({
							message: `${label} ${mergedLocalization.IS_INVALID}`
						})
						.optional();
		} else if (type === 'boolean') {
			schema = required
				? z.coerce
						.boolean({
							message: `${label} ${mergedLocalization.IS_INVALID}`
						})
						.refine((val) => val === true, {
							message: `${label} ${mergedLocalization.IS_REQUIRED}`
						})
				: z.coerce.boolean({
						message: `${label} ${mergedLocalization.IS_INVALID}`
					});
		} else {
			schema = required
				? z.string().min(1, `${label} ${mergedLocalization.IS_REQUIRED}`)
				: z.string().optional();
		}

		return z.object({ [name]: schema });
	});

	const form = createForm(() => ({
		defaultValues: {
			[name]: value || ''
		},
		onSubmit: async ({ value: values }) => {
			// Add small delay
			await new Promise((resolve) => setTimeout(resolve, 10));
			const newValue = values[name];

			if (value === newValue) {
				toast.error(`${label} ${mergedLocalization.IS_THE_SAME}`);
				return;
			}

			if (validate && typeof newValue === 'string' && !(await validate(newValue))) {
				form.setFieldMeta(name, (prev) => ({
					...prev,
					errors: [`${label} ${mergedLocalization.IS_INVALID}`]
				}));
				return;
			}

			try {
				await updateUser({ [name]: newValue });
				await onSessionChange?.();

				toast.success(`${label} ${mergedLocalization.UPDATED_SUCCESSFULLY}`);
			} catch (error) {
				toast.error(getLocalizedError({ error, localization: mergedLocalization }));
			}
		}
	}));

	const isSubmitting = $derived(form.state.isSubmitting);

	// Update form values when prop value changes
	// Use untrack to prevent infinite loop from form state updates
	$effect(() => {
		untrack(() => {
			form.setFieldValue(name, value || '');
		});
	});
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
>
	<SettingsCard
		{className}
		{classNames}
		{description}
		{instructions}
		{isPending}
		title={label}
		actionLabel={mergedLocalization.SAVE}
		{optimistic}
	>
		<CardContent class={classNames?.content}>
			{#if type === 'boolean'}
				<form.Field {name}>
					{#snippet children({ state, handleBlur, handleChange })}
						<div class="flex items-center gap-2">
							<Checkbox
								checked={state.value as boolean}
								onCheckedChange={(checked) => handleChange(checked)}
								disabled={isSubmitting}
								class={classNames?.checkbox}
							/>

							<Label class={classNames?.label}>
								{#if typeof label === 'string'}
									{label}
								{:else if label}
									{@render label()}
								{/if}
							</Label>

							{#if state.meta.errors.length > 0}
								<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
									{state.meta.errors[0]}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
			{:else if isPending}
				<Skeleton class={cn('h-9 w-full', classNames?.skeleton)} />
			{:else}
				<form.Field {name}>
					{#snippet children({ state, handleBlur, handleChange })}
						<div class="grid w-full items-center gap-1.5">
							{#if type === 'number'}
								<Input
									class={classNames?.input}
									type="number"
									placeholder={placeholder || (typeof label === 'string' ? label : '')}
									disabled={isSubmitting}
									value={state.value as string}
									onblur={handleBlur}
									oninput={(e) => handleChange(e.currentTarget.value)}
								/>
							{:else if multiline}
								<Textarea
									class={classNames?.input}
									placeholder={placeholder || (typeof label === 'string' ? label : '')}
									disabled={isSubmitting}
									value={state.value as string}
									onblur={handleBlur}
									oninput={(e) => handleChange(e.currentTarget.value)}
								/>
							{:else}
								<Input
									class={classNames?.input}
									type="text"
									placeholder={placeholder || (typeof label === 'string' ? label : '')}
									disabled={isSubmitting}
									value={state.value as string}
									onblur={handleBlur}
									oninput={(e) => handleChange(e.currentTarget.value)}
								/>
							{/if}

							{#if state.meta.errors.length > 0}
								<p class={cn('text-sm font-medium text-destructive', classNames?.error)}>
									{state.meta.errors[0]}
								</p>
							{/if}
						</div>
					{/snippet}
				</form.Field>
			{/if}
		</CardContent>
	</SettingsCard>
</form>
