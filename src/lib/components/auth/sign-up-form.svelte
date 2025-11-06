<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '$lib/utils/form.svelte';
	import { getAuthClient, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { BaseComponentProps } from '$lib/types';

	interface Props {
		className?: string;
		classNames?: Record<string, string>;
		onSuccess?: () => void;
		redirectTo?: string;
	}

	let { className, classNames, onSuccess, redirectTo }: Props = $props();

	const authClient = getAuthClient();
	const loc = getLocalization();

	// Form schema
	const schema = z
		.object({
			name: z.string().min(2, loc.NAME_REQUIRED),
			email: z.string().email(loc.EMAIL_INVALID),
			password: z.string().min(8, loc.PASSWORD_MIN_LENGTH),
			confirmPassword: z.string()
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: loc.PASSWORDS_DO_NOT_MATCH,
			path: ['confirmPassword']
		});

	// Create form
	const form = createForm({
		schema,
		initialValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: ''
		},
		onSubmit: async (values) => {
			await authClient.signUp.email(
				{
					email: values.email,
					password: values.password,
					name: values.name
				},
				{
					onSuccess: () => {
						if (onSuccess) {
							onSuccess();
						} else if (redirectTo) {
							window.location.href = redirectTo;
						}
					},
					onError: (ctx: any) => {
						throw new Error(ctx.error.message || loc.SOMETHING_WENT_WRONG);
					}
				}
			);
		}
	});
</script>

<div class={className}>
	<form onsubmit={form.handleSubmit} class="space-y-4">
		<div class="space-y-2">
			<Label for="name">{loc.NAME}</Label>
			<Input
				id="name"
				type="text"
				placeholder={loc.NAME_PLACEHOLDER}
				bind:value={form.data.name}
				disabled={form.isSubmitting}
			/>
			{#if form.errors.name}
				<p class="text-sm text-red-500">{form.errors.name[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="email">{loc.EMAIL}</Label>
			<Input
				id="email"
				type="email"
				placeholder={loc.EMAIL_PLACEHOLDER}
				bind:value={form.data.email}
				disabled={form.isSubmitting}
			/>
			{#if form.errors.email}
				<p class="text-sm text-red-500">{form.errors.email[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="password">{loc.PASSWORD}</Label>
			<Input
				id="password"
				type="password"
				placeholder={loc.PASSWORD_PLACEHOLDER}
				bind:value={form.data.password}
				disabled={form.isSubmitting}
			/>
			{#if form.errors.password}
				<p class="text-sm text-red-500">{form.errors.password[0]}</p>
			{/if}
		</div>

		<div class="space-y-2">
			<Label for="confirmPassword">{loc.CONFIRM_PASSWORD}</Label>
			<Input
				id="confirmPassword"
				type="password"
				placeholder={loc.CONFIRM_PASSWORD_PLACEHOLDER}
				bind:value={form.data.confirmPassword}
				disabled={form.isSubmitting}
			/>
			{#if form.errors.confirmPassword}
				<p class="text-sm text-red-500">{form.errors.confirmPassword[0]}</p>
			{/if}
		</div>

		{#if form.submitError}
			<div class="rounded-md bg-red-50 p-3">
				<p class="text-sm text-red-800">{form.submitError}</p>
			</div>
		{/if}

		<Button type="submit" disabled={form.isSubmitting} class="w-full">
			{form.isSubmitting ? loc.LOADING : loc.SIGN_UP}
		</Button>
	</form>
</div>
