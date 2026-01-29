<script lang="ts">
	import { z } from 'zod';
	import { createForm } from '@tanstack/svelte-form';
	import { Loader2, Trash2, UploadCloud } from '@lucide/svelte';
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
	import {
		getLocalizedError,
		getPasswordSchema,
		getSearchParam,
		getFieldError
	} from '$lib/utils/utils.js';
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
	const localization = $derived({ ...contextLocalization, ...propLocalization });
	const passwordValidation = $derived({
		...config.credentials?.passwordValidation,
		...propPasswordValidation
	});

	// Configuration from context
	const authClient = config.authClient;
	const additionalFields = config.additionalFields;
	const basePath = config.basePath;
	const baseURL = config.baseURL;
	const credentials = config.credentials;
	const emailVerification = config.emailVerification;
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
	let captchaRef = $state<unknown>(null);

	// Sync captchaRef with the hook
	$effect(() => {
		captchaHook.captchaRef = captchaRef;
	});

	// Success transition for navigation
	const redirectToValue = $derived(redirectTo);
	const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({
		redirectTo: redirectToValue
	});

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
	const defaultFields = {
		email: z.email({
			error: `${localization.EMAIL} ${localization.IS_INVALID}`
		}),
		password: getPasswordSchema(passwordValidation, localization),
		name:
			signUpFields?.includes('name') && nameRequired
				? z.string().min(1, {
						error: `${localization.NAME} ${localization.IS_REQUIRED}`
					})
				: z.string().optional(),
		image: z.string().optional(),
		username: usernameEnabled
			? z.string().min(1, {
					error: `${localization.USERNAME} ${localization.IS_REQUIRED}`
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

	const schemaFields = {} as Record<string, z.ZodTypeAny>;

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
		.object({
			...defaultFields,
			...schemaFields
		})
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
	const defaultValues = {
		email: '',
		password: '',
		...(confirmPasswordEnabled && { confirmPassword: '' }),
		...(signUpFields?.includes('name') ? { name: '' } : {}),
		...(usernameEnabled ? { username: '' } : {}),
		...(signUpFields?.includes('image') && avatar ? { image: '' } : {})
	} as Record<string, unknown>;

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
				form.setFieldValue('image', image);
			} else {
				avatarImage = null;
				form.setFieldValue('image', '');
			}
		} catch (error) {
			console.error(error);
			toast.error(getLocalizedError({ error, localization }));
		}

		uploadingAvatar = false;
	}

	function handleDeleteAvatar() {
		avatarImage = null;
		form.setFieldValue('image', '');
	}

	function openFileDialog() {
		fileInputRef?.click();
	}

	// Sign up function
	async function signUp(values: z.infer<typeof formSchema>) {
		const { email, password, name, username, image, ...additionalFieldValues } = values;

		try {
			// Validate additional fields with custom validators if provided
			for (const [field, value] of Object.entries(additionalFieldValues)) {
				const additionalField = additionalFields?.[field];
				if (!additionalField?.validate) continue;

				if (typeof value === 'string' && !(await additionalField.validate(value))) {
					form.setFieldMeta(field as never, (prev) => ({
						...prev,
						errorMap: {
							...prev.errorMap,
							onSubmit: `${additionalField.label} ${localization.IS_INVALID}`
						}
					}));
					return;
				}
			}

			// Prepare fetch options with captcha headers
			const fetchOptions: Record<string, unknown> = {
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

			// Determine the callback URL for email verification
			// If redirectToVerifyPage is true, redirect to verify-email page after verification
			let signUpCallbackURL = getCallbackURL();
			if (emailVerification?.redirectToVerifyPage) {
				const origin = baseURL || (typeof window !== 'undefined' ? window.location.origin : '');
				const verifyEmailPath = `${basePath}/${viewPaths.VERIFY_EMAIL}`;
				signUpCallbackURL = `${origin}${verifyEmailPath}?verified=true&email=${encodeURIComponent(email as string)}`;
			}

			const data = await authClient.signUp.email({
				email: email as string,
				password: password as string,
				name: (name as string) || '',
				...additionalParams,
				...additionalFieldValues,
				callbackURL: signUpCallbackURL,
				fetchOptions
			});

			// Handle success based on response
			if ('token' in data && data.token) {
				// User is signed in immediately
				await onSuccess();
			} else {
				// Email verification required - redirect to verify-email view
				// Note: This handles token-based email verification (default).
				// If the server uses emailOTP with overrideDefaultEmailVerification,
				// users receive OTP codes via email instead of verification links.
				const url = new URL(window.location.href);
				url.searchParams.set('email', email as string); // URLSearchParams handles encoding automatically
				navigate(`${basePath}/${viewPaths.VERIFY_EMAIL}?${url.searchParams.toString()}`);
				// Don't show a toast here since the verify-email view will show all needed info
			}
		} catch (error) {
			toast.error(getLocalizedError({ error, localization }));

			// Reset password fields on error
			form.setFieldValue('password', '');
			if (confirmPasswordEnabled) {
				form.setFieldValue('confirmPassword', '');
			}

			resetCaptcha();
		}
	}

	// Create form
	const form = createForm(() => ({
		defaultValues: defaultValues as z.infer<typeof formSchema>,
		onSubmit: async ({ value }) => await signUp(value)
	}));

	// Get field validators for all fields
	const emailValidator = $derived(formSchema.shape.email);
	const passwordValidator = $derived(formSchema.shape.password);
	const nameValidator = $derived(
		signUpFields?.includes('name') ? formSchema.shape.name : undefined
	);
	const usernameValidator = $derived(usernameEnabled ? formSchema.shape.username : undefined);
	const confirmPasswordValidator = $derived(
		confirmPasswordEnabled ? formSchema.shape.confirmPassword : undefined
	);
	const imageValidator = $derived(
		signUpFields?.includes('image') && avatar ? formSchema.shape.image : undefined
	);

	// Create validators for additional fields dynamically
	function getAdditionalFieldValidator(field: string) {
		return (formSchema.shape as Record<string, z.ZodTypeAny>)[field];
	}

	// Combine isSubmitting states
	const isSubmitting = $derived(form.state.isSubmitting || transitionPending);

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
	onsubmit={(e) => {
		e.preventDefault();
		form.handleSubmit();
	}}
	novalidate={hydrated.value}
	class={cn('grid w-full gap-6', className, classNames?.base)}
>
	<!-- Avatar Upload Field -->
	{#if signUpFields?.includes('image') && avatar}
		<form.Field name="image" validators={{ onChange: imageValidator }}>
			{#snippet children(field)}
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
							<DropdownMenu.Trigger class="size-fit rounded-full">
								{#snippet child({ props })}
									<Button
										{...props}
										class="size-fit rounded-full"
										size="icon"
										type="button"
										variant="ghost"
										disabled={uploadingAvatar}
									>
										<UserAvatar
											isPending={uploadingAvatar}
											className="size-16"
											user={avatarImage
												? {
														name: form.getFieldValue('name') as string,
														email: form.getFieldValue('email') as string,
														image: avatarImage
													}
												: null}
											{localization}
										/>
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>

							<DropdownMenu.Content align="start">
								<DropdownMenu.Item onclick={openFileDialog} disabled={uploadingAvatar}>
									<UploadCloud class="h-4 w-4" />
									{localization.UPLOAD_AVATAR}
								</DropdownMenu.Item>

								{#if avatarImage}
									<DropdownMenu.Item
										onclick={handleDeleteAvatar}
										disabled={uploadingAvatar}
										class="text-destructive focus:text-destructive"
									>
										<Trash2 class="h-4 w-4" />
										{localization.DELETE_AVATAR}
									</DropdownMenu.Item>
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<Button
							type="button"
							variant="outline"
							onclick={openFileDialog}
							disabled={uploadingAvatar}
						>
							{#if uploadingAvatar}
								<Loader2 class="h-4 w-4 animate-spin" />
							{/if}
							{localization.UPLOAD}
						</Button>
					</div>

					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-red-500', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<!-- Name Field -->
	{#if signUpFields?.includes('name')}
		<form.Field name="name" validators={{ onChange: nameValidator }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<Label for="name" class={classNames?.label}>{localization.NAME}</Label>
					<Input
						id="name"
						type="text"
						placeholder={localization.NAME_PLACEHOLDER}
						autocomplete="name"
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						disabled={isSubmitting}
						class={classNames?.input}
					/>
					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-red-500', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<!-- Username Field -->
	{#if usernameEnabled}
		<form.Field name="username" validators={{ onChange: usernameValidator }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<Label for="username" class={classNames?.label}>{localization.USERNAME}</Label>
					<Input
						id="username"
						type="text"
						autocomplete="username"
						placeholder={localization.USERNAME_PLACEHOLDER}
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						disabled={isSubmitting}
						class={classNames?.input}
					/>
					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-red-500', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<!-- Email Field -->
	<form.Field name="email" validators={{ onChange: emailValidator }}>
		{#snippet children(field)}
			<div class="space-y-2">
				<Label for="email" class={classNames?.label}>{localization.EMAIL}</Label>
				<Input
					id="email"
					type="email"
					autocomplete="email"
					placeholder={localization.EMAIL_PLACEHOLDER}
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
					disabled={isSubmitting}
					class={classNames?.input}
				/>
				{#if field.state.meta.errors.length > 0}
					<p class={cn('text-sm text-red-500', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<!-- Password Field -->
	<form.Field name="password" validators={{ onChange: passwordValidator }}>
		{#snippet children(field)}
			<div class="space-y-2">
				<Label for="password" class={classNames?.label}>{localization.PASSWORD}</Label>
				<PasswordInput
					id="password"
					placeholder={localization.PASSWORD_PLACEHOLDER}
					value={field.state.value}
					oninput={(e) => field.handleChange(e.currentTarget.value)}
					onblur={field.handleBlur}
					disabled={isSubmitting}
					autocomplete="new-password"
					class={classNames?.input}
					enableToggle
				/>
				{#if field.state.meta.errors.length > 0}
					<p class={cn('text-sm text-red-500', classNames?.error)}>
						{getFieldError(field.state.meta.errors[0])}
					</p>
				{/if}
			</div>
		{/snippet}
	</form.Field>

	<!-- Confirm Password Field -->
	{#if confirmPasswordEnabled}
		<form.Field name="confirmPassword" validators={{ onChange: confirmPasswordValidator }}>
			{#snippet children(field)}
				<div class="space-y-2">
					<Label for="confirmPassword" class={classNames?.label}>
						{localization.CONFIRM_PASSWORD}
					</Label>
					<PasswordInput
						id="confirmPassword"
						placeholder={localization.CONFIRM_PASSWORD_PLACEHOLDER}
						value={field.state.value}
						oninput={(e) => field.handleChange(e.currentTarget.value)}
						onblur={field.handleBlur}
						disabled={isSubmitting}
						autocomplete="new-password"
						class={classNames?.input}
						enableToggle
					/>
					{#if field.state.meta.errors.length > 0}
						<p class={cn('text-sm text-red-500', classNames?.error)}>
							{getFieldError(field.state.meta.errors[0])}
						</p>
					{/if}
				</div>
			{/snippet}
		</form.Field>
	{/if}

	<!-- Additional Fields -->
	{#if signUpFields}
		{#each signUpFields.filter((field) => field !== 'name' && field !== 'image') as field (field)}
			{@const additionalField = additionalFields?.[field]}
			{#if additionalField}
				<form.Field
					name={field as never}
					validators={{ onChange: getAdditionalFieldValidator(field) }}
				>
					{#snippet children(fieldState)}
						{#if additionalField.type === 'boolean'}
							<!-- Checkbox Field -->
							<div class="space-y-2">
								<div class="flex items-start space-x-2">
									<Checkbox
										id={field}
										checked={fieldState.state.value as boolean}
										onCheckedChange={(checked) => {
											fieldState.handleChange(checked as never);
										}}
										disabled={isSubmitting}
									/>
									<Label for={field} class={cn('font-normal', classNames?.label)}>
										{additionalField.label}
									</Label>
								</div>
								{#if fieldState.state.meta.errors.length > 0}
									<p class={cn('text-sm text-red-500', classNames?.error)}>
										{getFieldError(fieldState.state.meta.errors[0])}
									</p>
								{/if}
							</div>
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
									value={fieldState.state.value}
									oninput={(e) => fieldState.handleChange(e.currentTarget.value)}
									onblur={fieldState.handleBlur}
									disabled={isSubmitting}
									class={classNames?.input}
								/>
								{#if fieldState.state.meta.errors.length > 0}
									<p class={cn('text-sm text-red-500', classNames?.error)}>
										{getFieldError(fieldState.state.meta.errors[0])}
									</p>
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
									value={fieldState.state.value}
									oninput={(e) => fieldState.handleChange(e.currentTarget.value)}
									onblur={fieldState.handleBlur}
									disabled={isSubmitting}
									class={classNames?.input}
								/>
								{#if fieldState.state.meta.errors.length > 0}
									<p class={cn('text-sm text-red-500', classNames?.error)}>
										{getFieldError(fieldState.state.meta.errors[0])}
									</p>
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
									value={fieldState.state.value}
									oninput={(e) => fieldState.handleChange(e.currentTarget.value)}
									onblur={fieldState.handleBlur}
									disabled={isSubmitting}
									class={classNames?.input}
								/>
								{#if fieldState.state.meta.errors.length > 0}
									<p class={cn('text-sm text-red-500', classNames?.error)}>
										{getFieldError(fieldState.state.meta.errors[0])}
									</p>
								{/if}
							</div>
						{/if}
					{/snippet}
				</form.Field>
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
			<Loader2 class="h-4 w-4 animate-spin" />
		{/if}
		{localization.SIGN_UP_ACTION}
	</Button>
</form>
