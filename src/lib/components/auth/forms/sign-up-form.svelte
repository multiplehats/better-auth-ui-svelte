<script lang="ts">
	import { z } from 'zod';
	import { Loader2, Trash2, UploadCloud } from '@lucide/svelte';
	import { createForm } from '$lib/utils/form.svelte';
	import { getAuthUIConfig, getLocalization } from '$lib/context/auth-ui-config.svelte';
	import { useIsHydrated } from '$lib/hooks/use-hydrated.svelte';
	import { useCaptcha } from '$lib/hooks/use-captcha.svelte';
	import { useOnSuccessTransition } from '$lib/hooks/use-success-transition.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import PasswordInput from '$lib/components/password-input.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import Captcha from '$lib/components/captcha/captcha.svelte';
	import { cn } from '$lib/utils/ui.js';
	import { fileToBase64, resizeAndCropImage } from '$lib/utils/image-utils.js';
	import type { PasswordValidation } from '$lib/types/password-validation.js';
	import type { AuthLocalization } from '$lib/types/index.js';
	import { getLocalizedError, getPasswordSchema, getSearchParam } from '$lib/utils/utils.js';
	import type { AuthFormClassNames } from '../auth-form.svelte';

	interface Props {
		className?: string;
		classNames?: AuthFormClassNames;
		callbackURL?: string;
		isSubmitting?: boolean;
		localization?: Partial<AuthLocalization>;
		redirectTo?: string;
		setIsSubmitting?: (value: boolean) => void;
		passwordValidation?: PasswordValidation;
	}

	let {
		className,
		classNames,
		callbackURL,
		isSubmitting: externalIsSubmitting = $bindable(),
		localization: propLocalization,
		redirectTo,
		setIsSubmitting,
		passwordValidation: propPasswordValidation
	}: Props = $props();

	const config = getAuthUIConfig();
	const contextLocalization = getLocalization();
	const hydrated = useIsHydrated();

	// Merge configurations
	const localization = { ...contextLocalization, ...propLocalization };
	const passwordValidation = {
		...config.credentials?.passwordValidation,
		...propPasswordValidation
	};

	// Configuration from context
	const authClient = config.authClient;
	const additionalFields = config.additionalFields;
	const basePath = config.basePath;
	const baseURL = config.baseURL;
	const credentials = config.credentials;
	const nameRequired = config.nameRequired;
	const persistClient = config.persistClient;
	const contextRedirectTo = config.redirectTo;
	const signUpOptions = config.signUp;
	const viewPaths = config.viewPaths;
	const navigate = config.navigate;
	const toast = config.toast;
	const avatar = config.avatar;

	const confirmPasswordEnabled = credentials?.confirmPassword;
	const usernameEnabled = credentials?.username;
	const signUpFields = signUpOptions?.fields || ['name'];

	// Avatar upload state
	let fileInputRef: HTMLInputElement | undefined = $state();
	let avatarImage = $state<string | null>(null);
	let uploadingAvatar = $state(false);

	// Captcha integration
	const captchaHook = useCaptcha({ localization });
	const { getCaptchaHeaders, resetCaptcha } = captchaHook;

	// Local state for captcha binding
	let captchaRef = $state<any>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	// Success transition for navigation
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({ redirectTo });

	// Helper functions
	function getRedirectTo() {
		return redirectTo || getSearchParam('redirectTo') || contextRedirectTo;
	}

	function getCallbackURL() {
		return `${baseURL || ''}${
			callbackURL ||
			(persistClient
				? `${basePath}/${viewPaths.CALLBACK}?redirectTo=${encodeURIComponent(getRedirectTo())}`
				: getRedirectTo())
		}`;
	}

	// Build form schema
	const defaultFields: Record<string, z.ZodTypeAny> = {
		email: z.string().email({
			message: `${localization.EMAIL} ${localization.IS_INVALID}`
		}),
		password: getPasswordSchema(passwordValidation, localization),
		name:
			signUpFields?.includes('name') && nameRequired
				? z.string().min(1, {
						message: `${localization.NAME} ${localization.IS_REQUIRED}`
					})
				: z.string().optional(),
		image: z.string().optional(),
		username: usernameEnabled
			? z.string().min(1, {
					message: `${localization.USERNAME} ${localization.IS_REQUIRED}`
				})
			: z.string().optional(),
		confirmPassword: confirmPasswordEnabled
			? getPasswordSchema(passwordValidation, {
					PASSWORD_REQUIRED: localization.CONFIRM_PASSWORD_REQUIRED,
					PASSWORD_TOO_SHORT: localization.PASSWORD_TOO_SHORT,
					PASSWORD_TOO_LONG: localization.PASSWORD_TOO_LONG,
					INVALID_PASSWORD: localization.INVALID_PASSWORD
				} as AuthLocalization)
			: z.string().optional()
	};

	const schemaFields: Record<string, z.ZodTypeAny> = {};

	// Add additional fields from signUpFields
	if (signUpFields) {
		for (const field of signUpFields) {
			if (field === 'name' || field === 'image') continue;

			const additionalField = additionalFields?.[field];
			if (!additionalField) continue;

			let fieldSchema: z.ZodTypeAny;

			// Create the appropriate schema based on field type
			if (additionalField.type === 'number') {
				fieldSchema = additionalField.required
					? z.preprocess(
							(val) => (!val ? undefined : Number(val)),
							z.number({
								message: `${additionalField.label} ${localization.IS_INVALID}`
							})
						)
					: z.coerce
							.number({
								message: `${additionalField.label} ${localization.IS_INVALID}`
							})
							.optional();
			} else if (additionalField.type === 'boolean') {
				fieldSchema = additionalField.required
					? z.coerce
							.boolean({
								message: `${additionalField.label} ${localization.IS_INVALID}`
							})
							.refine((val) => val === true, {
								message: `${additionalField.label} ${localization.IS_REQUIRED}`
							})
					: z.coerce
							.boolean({
								message: `${additionalField.label} ${localization.IS_INVALID}`
							})
							.optional();
			} else {
				fieldSchema = additionalField.required
					? z.string().min(1, `${additionalField.label} ${localization.IS_REQUIRED}`)
					: z.string().optional();
			}

			schemaFields[field] = fieldSchema;
		}
	}

	const formSchema = z
		.object(defaultFields)
		.extend(schemaFields)
		.refine(
			(data) => {
				// Skip validation if confirmPassword is not enabled
				if (!confirmPasswordEnabled) return true;
				return data.password === data.confirmPassword;
			},
			{
				message: localization.PASSWORDS_DO_NOT_MATCH!,
				path: ['confirmPassword']
			}
		);

	// Create default values for the form
	const defaultValues: Record<string, unknown> = {
		email: '',
		password: '',
		...(confirmPasswordEnabled && { confirmPassword: '' }),
		...(signUpFields?.includes('name') ? { name: '' } : {}),
		...(usernameEnabled ? { username: '' } : {}),
		...(signUpFields?.includes('image') && avatar ? { image: '' } : {})
	};

	// Add default values for additional fields
	if (signUpFields) {
		for (const field of signUpFields) {
			if (field === 'name' || field === 'image') continue;
			const additionalField = additionalFields?.[field];
			if (!additionalField) continue;

			defaultValues[field] = additionalField.type === 'boolean' ? false : '';
		}
	}

	// Avatar upload handlers
	async function handleAvatarChange(file: File) {
		if (!avatar) return;

		uploadingAvatar = true;

		try {
			const resizedFile = await resizeAndCropImage(
				file,
				crypto.randomUUID(),
				avatar.size,
				avatar.extension
			);

			let image: string | undefined | null;

			if (avatar.upload) {
				image = await avatar.upload(resizedFile);
			} else {
				image = await fileToBase64(resizedFile);
			}

			if (image) {
				avatarImage = image;
				form.data.image = image;
			} else {
				avatarImage = null;
				form.data.image = '';
			}
		} catch (error) {
			console.error(error);
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});
		}

		uploadingAvatar = false;
	}

	function handleDeleteAvatar() {
		avatarImage = null;
		form.data.image = '';
	}

	function openFileDialog() {
		fileInputRef?.click();
	}

	// Sign up function
	async function signUp(values: z.infer<typeof formSchema>) {
		const { email, password, name, username, confirmPassword, image, ...additionalFieldValues } =
			values;

		try {
			// Validate additional fields with custom validators if provided
			for (const [field, value] of Object.entries(additionalFieldValues)) {
				const additionalField = additionalFields?.[field];
				if (!additionalField?.validate) continue;

				if (typeof value === 'string' && !(await additionalField.validate(value))) {
					form.setError(field, {
						message: `${additionalField.label} ${localization.IS_INVALID}`
					});
					return;
				}
			}

			// Prepare fetch options with captcha headers
			const fetchOptions: any = {
				throw: true,
				headers: await getCaptchaHeaders('/sign-up/email')
			};

			const additionalParams: Record<string, unknown> = {};

			if (username !== undefined) {
				additionalParams.username = username;
			}

			if (image !== undefined) {
				additionalParams.image = image;
			}

			const data = await authClient.signUp.email({
				email: email as string,
				password: password as string,
				name: (name as string) || '',
				...additionalParams,
				...additionalFieldValues,
				callbackURL: getCallbackURL(),
				fetchOptions
			});

			// Handle success based on response
			if ('token' in data && data.token) {
				// User is signed in immediately
				await onSuccess();
			} else {
				// Email verification required
				navigate(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`);
				toast({
					variant: 'success',
					message: localization.SIGN_UP_EMAIL!
				});
			}
		} catch (error) {
			toast({
				variant: 'error',
				message: getLocalizedError({ error, localization })
			});

			// Reset password fields on error
			form.data.password = '';
			if (confirmPasswordEnabled) {
				form.data.confirmPassword = '';
			}

			resetCaptcha();
		}
	}

	// Create form
	const form = createForm({
		schema: formSchema,
		initialValues: defaultValues,
		onSubmit: signUp
	});

	// Combine isSubmitting states
	const isSubmitting = $derived(form.isSubmitting || transitionPending);

	// Sync external isSubmitting
	$effect(() => {
		if (externalIsSubmitting !== undefined) {
			externalIsSubmitting = isSubmitting;
		}
		if (setIsSubmitting) {
			setIsSubmitting(isSubmitting);
		}
	});
</script>

<form
	onsubmit={form.handleSubmit}
	novalidate={hydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<!-- Avatar Upload Field -->
	{#if signUpFields?.includes('image') && avatar}
		<input
			bind:this={fileInputRef}
			accept="image/*"
			disabled={uploadingAvatar}
			hidden
			type="file"
			onchange={(e) => {
				const file = e.currentTarget.files?.item(0);
				if (file) handleAvatarChange(file);
				e.currentTarget.value = '';
			}}
		/>

		<div class="space-y-2">
			<Label class={classNames?.label}>{localization.AVATAR}</Label>

			<div class="flex items-center gap-4">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							class="size-fit rounded-full"
							size="icon"
							variant="ghost"
							type="button"
						>
							<UserAvatar
								isPending={uploadingAvatar}
								className="size-16"
								user={avatarImage
									? {
											name: form.data.name as string,
											email: form.data.email as string,
											image: avatarImage
										}
									: null}
								{localization}
							/>
						</Button>
					</DropdownMenu.Trigger>

					<DropdownMenu.Content align="start">
						<DropdownMenu.Item onclick={openFileDialog} disabled={uploadingAvatar}>
							<UploadCloud class="mr-2 h-4 w-4" />
							{localization.UPLOAD_AVATAR}
						</DropdownMenu.Item>

						{#if avatarImage}
							<DropdownMenu.Item
								onclick={handleDeleteAvatar}
								disabled={uploadingAvatar}
								class="text-destructive focus:text-destructive"
							>
								<Trash2 class="mr-2 h-4 w-4" />
								{localization.DELETE_AVATAR}
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<Button type="button" variant="outline" onclick={openFileDialog} disabled={uploadingAvatar}>
					{#if uploadingAvatar}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					{localization.UPLOAD}
				</Button>
			</div>

			{#if form.errors.image}
				<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors.image[0]}</p>
			{/if}
		</div>
	{/if}

	<!-- Name Field -->
	{#if signUpFields?.includes('name')}
		<div class="space-y-2">
			<Label for="name" class={classNames?.label}>{localization.NAME}</Label>
			<Input
				id="name"
				type="text"
				placeholder={localization.NAME_PLACEHOLDER}
				bind:value={form.data.name}
				disabled={isSubmitting}
				class={classNames?.input}
			/>
			{#if form.errors.name}
				<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors.name[0]}</p>
			{/if}
		</div>
	{/if}

	<!-- Username Field -->
	{#if usernameEnabled}
		<div class="space-y-2">
			<Label for="username" class={classNames?.label}>{localization.USERNAME}</Label>
			<Input
				id="username"
				type="text"
				placeholder={localization.USERNAME_PLACEHOLDER}
				bind:value={form.data.username}
				disabled={isSubmitting}
				class={classNames?.input}
			/>
			{#if form.errors.username}
				<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors.username[0]}</p>
			{/if}
		</div>
	{/if}

	<!-- Email Field -->
	<div class="space-y-2">
		<Label for="email" class={classNames?.label}>{localization.EMAIL}</Label>
		<Input
			id="email"
			type="email"
			placeholder={localization.EMAIL_PLACEHOLDER}
			bind:value={form.data.email}
			disabled={isSubmitting}
			class={classNames?.input}
		/>
		{#if form.errors.email}
			<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors.email[0]}</p>
		{/if}
	</div>

	<!-- Password Field -->
	<div class="space-y-2">
		<Label for="password" class={classNames?.label}>{localization.PASSWORD}</Label>
		<PasswordInput
			id="password"
			placeholder={localization.PASSWORD_PLACEHOLDER}
			bind:value={form.data.password}
			disabled={isSubmitting}
			autocomplete="new-password"
			class={classNames?.input}
			enableToggle
		/>
		{#if form.errors.password}
			<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors.password[0]}</p>
		{/if}
	</div>

	<!-- Confirm Password Field -->
	{#if confirmPasswordEnabled}
		<div class="space-y-2">
			<Label for="confirmPassword" class={classNames?.label}>{localization.CONFIRM_PASSWORD}</Label>
			<PasswordInput
				id="confirmPassword"
				placeholder={localization.CONFIRM_PASSWORD_PLACEHOLDER}
				bind:value={form.data.confirmPassword}
				disabled={isSubmitting}
				autocomplete="new-password"
				class={classNames?.input}
				enableToggle
			/>
			{#if form.errors.confirmPassword}
				<p class={cn('text-sm text-red-500', classNames?.error)}>
					{form.errors.confirmPassword[0]}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Additional Fields -->
	{#if signUpFields}
		{#each signUpFields.filter((field) => field !== 'name' && field !== 'image') as field}
			{@const additionalField = additionalFields?.[field]}
			{#if additionalField}
				{#if additionalField.type === 'boolean'}
					<!-- Checkbox Field -->
					<div class="flex items-start space-x-2">
						<Checkbox
							id={field}
							checked={form.data[field]}
							onCheckedChange={(checked) => {
								form.data[field] = checked;
							}}
							disabled={isSubmitting}
						/>
						<Label for={field} class={cn('font-normal', classNames?.label)}>
							{additionalField.label}
						</Label>
					</div>
					{#if form.errors[field]}
						<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors[field][0]}</p>
					{/if}
				{:else if additionalField.type === 'number'}
					<!-- Number Field -->
					<div class="space-y-2">
						<Label for={field} class={classNames?.label}>
							{additionalField.label}
						</Label>
						<Input
							id={field}
							type="number"
							placeholder={additionalField.placeholder ||
								(typeof additionalField.label === 'string' ? additionalField.label : '')}
							bind:value={form.data[field]}
							disabled={isSubmitting}
							class={classNames?.input}
						/>
						{#if form.errors[field]}
							<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors[field][0]}</p>
						{/if}
					</div>
				{:else if additionalField.multiline}
					<!-- Textarea Field -->
					<div class="space-y-2">
						<Label for={field} class={classNames?.label}>
							{additionalField.label}
						</Label>
						<Textarea
							id={field}
							placeholder={additionalField.placeholder ||
								(typeof additionalField.label === 'string' ? additionalField.label : '')}
							bind:value={form.data[field]}
							disabled={isSubmitting}
							class={classNames?.input}
						/>
						{#if form.errors[field]}
							<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors[field][0]}</p>
						{/if}
					</div>
				{:else}
					<!-- Text Field -->
					<div class="space-y-2">
						<Label for={field} class={classNames?.label}>
							{additionalField.label}
						</Label>
						<Input
							id={field}
							type="text"
							placeholder={additionalField.placeholder ||
								(typeof additionalField.label === 'string' ? additionalField.label : '')}
							bind:value={form.data[field]}
							disabled={isSubmitting}
							class={classNames?.input}
						/>
						{#if form.errors[field]}
							<p class={cn('text-sm text-red-500', classNames?.error)}>{form.errors[field][0]}</p>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Additional field not found, log error -->
				{console.error(`Additional field ${field} not found`)}
			{/if}
		{/each}
	{/if}

	<!-- Captcha Component -->
	<Captcha bind:ref={captchaRef} {localization} action="/sign-up/email" />

	<!-- Submit Button -->
	<Button
		type="submit"
		disabled={isSubmitting}
		class={cn('w-full', classNames?.button, classNames?.primaryButton)}
	>
		{#if isSubmitting}
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		{localization.SIGN_UP_ACTION}
	</Button>
</form>
