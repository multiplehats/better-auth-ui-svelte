<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import { setAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { authLocalization } from '$lib/localization/auth-localization.js';
	import DefaultLink from './default-link.svelte';
	import RecaptchaV3 from './captcha/recaptcha-v3.svelte';
	import OrganizationRefetcher from './organization-refetcher.svelte';
	import type {
		AnyAuthClient,
		AuthHooks,
		AuthMutators,
		AccountOptions,
		AccountOptionsContext,
		OrganizationOptions,
		OrganizationOptionsContext,
		AvatarOptions,
		DeleteUserOptions,
		SocialOptions,
		GenericOAuthOptions,
		CredentialsOptions,
		SignUpOptions,
		Link,
		RenderToast,
		AuthLocalization,
		AdditionalFields,
		GravatarOptions
	} from '$lib/types/index.js';
	import type { AuthViewPaths } from '$lib/utils/view-paths.js';
	import { authViewPaths, accountViewPaths, organizationViewPaths } from '$lib/utils/view-paths.js';
	import { useAuthData } from '$lib/stores/use-auth-data.svelte.js';

	interface Props {
		children: Snippet;
		/**
		 * Better Auth client returned from createAuthClient
		 */
		authClient: AnyAuthClient;
		/**
		 * Enable account view & account configuration
		 * @default { fields: ["image", "name"] }
		 */
		account?: boolean | Partial<AccountOptions>;
		/**
		 * Additional fields for users
		 */
		additionalFields?: AdditionalFields;
		/**
		 * API Key plugin configuration
		 */
		apiKey?:
			| {
					/**
					 * Prefix for API Keys
					 */
					prefix?: string;
					/**
					 * Metadata for API Keys
					 */
					metadata?: Record<string, unknown>;
			  }
			| boolean;
		/**
		 * Avatar configuration
		 * @default undefined
		 */
		avatar?: boolean | Partial<AvatarOptions>;
		/**
		 * User Account deletion configuration
		 * @default undefined
		 */
		deleteUser?: DeleteUserOptions | boolean;
		/**
		 * Show Verify Email card for unverified emails
		 */
		emailVerification?: boolean;
		/**
		 * Enable or disable Email OTP support
		 * @default false
		 */
		emailOTP?: boolean;
		/**
		 * Gravatar configuration
		 */
		gravatar?: boolean | GravatarOptions;
		/**
		 * ADVANCED: Custom hooks for fetching auth data
		 */
		hooks?: Partial<AuthHooks>;
		/**
		 * Enable or disable Magic Link support
		 * @default false
		 */
		magicLink?: boolean;
		/**
		 * Enable or disable Multi Session support
		 * @default false
		 */
		multiSession?: boolean;
		/**
		 * Customize the paths for the auth views
		 */
		viewPaths?: Partial<AuthViewPaths>;
		/**
		 * Render custom Toasts
		 * @default console toast
		 */
		toast?: RenderToast;
		/**
		 * Customize the Localization strings
		 */
		localization?: Partial<AuthLocalization>;
		/**
		 * ADVANCED: Custom mutators for updating auth data
		 */
		mutators?: Partial<AuthMutators>;
		/**
		 * Enable or disable One Tap support
		 * @default false
		 */
		oneTap?: boolean;
		/**
		 * Perform some User updates optimistically
		 * @default false
		 */
		optimistic?: boolean;
		/**
		 * Organization plugin configuration
		 */
		organization?: OrganizationOptions | boolean;
		/**
		 * Enable or disable Passkey support
		 * @default false
		 */
		passkey?: boolean;
		/**
		 * Forces better-auth-tanstack to refresh the Session on the auth callback page
		 * @default false
		 */
		persistClient?: boolean;
		/**
		 * Enable or disable Credentials support
		 * @default { forgotPassword: true }
		 */
		credentials?: boolean | CredentialsOptions;
		/**
		 * Enable or disable Sign Up form
		 * @default { fields: ["name"] }
		 */
		signUp?: SignUpOptions | boolean;
		/**
		 * Base path for the auth views
		 * @default "/auth"
		 */
		basePath?: string;
		/**
		 * Front end base URL for auth API callbacks
		 */
		baseURL?: string;
		/**
		 * Default redirect URL after authenticating
		 * @default "/"
		 */
		redirectTo?: string;
		/**
		 * Enable or disable user change email support
		 * @default true
		 */
		changeEmail?: boolean;
		/**
		 * Freshness age for Session data (in seconds)
		 * @default 60 * 60 * 24
		 */
		freshAge?: number;
		/**
		 * Whether the name field should be required
		 * @default true
		 */
		nameRequired?: boolean;
		/**
		 * Social provider configuration
		 */
		social?: SocialOptions;
		/**
		 * Generic OAuth provider configuration
		 */
		genericOAuth?: GenericOAuthOptions;
		/**
		 * Enable or disable two-factor authentication support
		 * @default undefined
		 */
		twoFactor?: ('otp' | 'totp')[];
		/**
		 * Navigate to a new URL
		 */
		navigate?: (href: string) => void;
		/**
		 * Called whenever the Session changes
		 */
		onSessionChange?: () => void | Promise<void>;
		/**
		 * Replace the current URL
		 */
		replace?: (href: string) => void;
		/**
		 * Custom Link component for navigation
		 */
		Link?: Link;
		/**
		 * Theme (light/dark)
		 */
		theme?: 'light' | 'dark';
		/**
		 * All other props
		 */
		[key: string]: any;
	}

	let {
		children,
		authClient: authClientProp,
		account: accountProp,
		additionalFields,
		apiKey,
		avatar: avatarProp,
		deleteUser: deleteUserProp,
		emailVerification,
		emailOTP,
		gravatar,
		social: socialProp,
		genericOAuth: genericOAuthProp,
		magicLink,
		multiSession,
		oneTap,
		optimistic,
		passkey,
		persistClient,
		twoFactor,
		basePath: basePathProp = '/auth',
		baseURL: baseURLProp = '',
		captcha,
		redirectTo: redirectToProp = '/',
		credentials: credentialsProp,
		changeEmail = true,
		freshAge = 60 * 60 * 24,
		hooks: hooksProp,
		mutators: mutatorsProp,
		localization: localizationProp,
		nameRequired = true,
		organization: organizationProp,
		signUp: signUpProp = true,
		toast: toastProp,
		viewPaths: viewPathsProp,
		navigate: navigateProp,
		onSessionChange,
		replace: replaceProp,
		Link: LinkProp,
		theme = 'light',
		...props
	}: Props = $props();

	const authClient = authClientProp;

	// Default navigation functions
	const defaultNavigate = (href: string) => {
		window.location.href = href;
	};

	const defaultReplace = (href: string) => {
		window.location.replace(href);
	};

	// Default toast implementation
	const defaultToast: RenderToast = ({ variant = 'default', message }) => {
		console.log(`[${variant}]`, message);
	};

	// Process avatar prop
	const avatar = $derived.by(() => {
		if (!avatarProp) return undefined;

		if (avatarProp === true) {
			return {
				extension: 'png',
				size: 128
			};
		}

		return {
			upload: avatarProp.upload,
			delete: avatarProp.delete,
			extension: avatarProp.extension || 'png',
			size: avatarProp.size || (avatarProp.upload ? 256 : 128),
			Image: avatarProp.Image
		};
	});

	// Process account prop
	const account = $derived.by((): AccountOptionsContext | undefined => {
		if (accountProp === false) return undefined;

		if (accountProp === true || accountProp === undefined) {
			return {
				basePath: '/account',
				fields: ['image', 'name'],
				viewPaths: accountViewPaths
			};
		}

		// Remove trailing slash from basePath
		const basePath = accountProp.basePath?.endsWith('/')
			? accountProp.basePath.slice(0, -1)
			: accountProp.basePath;

		return {
			basePath: basePath ?? '/account',
			fields: accountProp.fields || ['image', 'name'],
			viewPaths: { ...accountViewPaths, ...accountProp.viewPaths }
		};
	});

	// Process deleteUser prop
	const deleteUser = $derived.by((): DeleteUserOptions | undefined => {
		if (!deleteUserProp) return undefined;
		if (deleteUserProp === true) return {};
		return deleteUserProp;
	});

	// Process social prop
	const social = $derived.by((): SocialOptions | undefined => {
		if (!socialProp) return undefined;
		return socialProp;
	});

	// Process genericOAuth prop
	const genericOAuth = $derived.by((): GenericOAuthOptions | undefined => {
		if (!genericOAuthProp) return undefined;
		return genericOAuthProp;
	});

	// Process credentials prop
	const credentials = $derived.by((): CredentialsOptions | undefined => {
		if (credentialsProp === false) return undefined;

		if (credentialsProp === true) {
			return {
				forgotPassword: true
			};
		}

		return {
			...credentialsProp,
			forgotPassword: credentialsProp?.forgotPassword ?? true
		};
	});

	// Process signUp prop
	const signUp = $derived.by((): SignUpOptions | undefined => {
		if (signUpProp === false) return undefined;

		if (signUpProp === true || signUpProp === undefined) {
			return {
				fields: ['name']
			};
		}

		return {
			fields: signUpProp.fields || ['name']
		};
	});

	// Process organization prop
	const organization = $derived.by((): OrganizationOptionsContext | undefined => {
		if (!organizationProp) return undefined;

		if (organizationProp === true) {
			return {
				basePath: '/organization',
				viewPaths: organizationViewPaths,
				customRoles: []
			};
		}

		let logo: OrganizationOptionsContext['logo'] | undefined;

		if (organizationProp.logo === true) {
			logo = {
				extension: 'png',
				size: 128
			};
		} else if (organizationProp.logo) {
			logo = {
				upload: organizationProp.logo.upload,
				delete: organizationProp.logo.delete,
				extension: organizationProp.logo.extension || 'png',
				size: organizationProp.logo.size || (organizationProp.logo.upload ? 256 : 128)
			};
		}

		// Remove trailing slash from basePath
		const basePath = organizationProp.basePath?.endsWith('/')
			? organizationProp.basePath.slice(0, -1)
			: organizationProp.basePath;

		return {
			...organizationProp,
			logo,
			basePath: basePath ?? '/organization',
			customRoles: organizationProp.customRoles || [],
			viewPaths: {
				...organizationViewPaths,
				...organizationProp.viewPaths
			}
		};
	});

	// Default mutators
	const defaultMutators = $derived.by((): AuthMutators => {
		return {
			deleteApiKey: (params) =>
				authClient.apiKey.delete({
					...params,
					fetchOptions: { throw: true }
				}),
			deletePasskey: (params) =>
				authClient.passkey.deletePasskey({
					...params,
					fetchOptions: { throw: true }
				}),
			revokeDeviceSession: (params) =>
				authClient.multiSession.revoke({
					...params,
					fetchOptions: { throw: true }
				}),
			revokeSession: (params) =>
				authClient.revokeSession({
					...params,
					fetchOptions: { throw: true }
				}),
			setActiveSession: (params) =>
				authClient.multiSession.setActive({
					...params,
					fetchOptions: { throw: true }
				}),
			updateOrganization: (params) =>
				authClient.organization.update({
					...params,
					fetchOptions: { throw: true }
				}),
			updateUser: (params) =>
				authClient.updateUser({
					...params,
					fetchOptions: { throw: true }
				}),
			unlinkAccount: (params) =>
				authClient.unlinkAccount({
					...params,
					fetchOptions: { throw: true }
				})
		};
	});

	// Default hooks
	const defaultHooks = $derived.by((): AuthHooks => {
		return {
			useSession: authClient.useSession,
			useListAccounts: () =>
				useAuthData({
					queryFn: authClient.listAccounts,
					cacheKey: 'listAccounts'
				}),
			useAccountInfo: (params) =>
				useAuthData({
					queryFn: () => authClient.accountInfo(params),
					cacheKey: `accountInfo:${JSON.stringify(params)}`
				}),
			useListDeviceSessions: () =>
				useAuthData({
					queryFn: authClient.multiSession.listDeviceSessions,
					cacheKey: 'listDeviceSessions'
				}),
			useListSessions: () =>
				useAuthData({
					queryFn: authClient.listSessions,
					cacheKey: 'listSessions'
				}),
			useListPasskeys: authClient.useListPasskeys,
			useListApiKeys: () =>
				useAuthData({
					queryFn: authClient.apiKey.list,
					cacheKey: 'listApiKeys'
				}),
			useActiveOrganization: authClient.useActiveOrganization,
			useListOrganizations: authClient.useListOrganizations,
			useHasPermission: (params) =>
				useAuthData({
					queryFn: () =>
						authClient.$fetch('/organization/has-permission', {
							method: 'POST',
							body: params
						}),
					cacheKey: `hasPermission:${JSON.stringify(params)}`
				}),
			useInvitation: (params) =>
				useAuthData({
					queryFn: () => authClient.organization.getInvitation(params),
					cacheKey: `invitation:${JSON.stringify(params)}`
				}),
			useListInvitations: (params) =>
				useAuthData({
					queryFn: () =>
						authClient.$fetch(
							`/organization/list-invitations?organizationId=${params?.query?.organizationId || ''}`
						),
					cacheKey: `listInvitations:${JSON.stringify(params)}`
				}),
			useListUserInvitations: () =>
				useAuthData({
					queryFn: () => authClient.$fetch('/organization/list-user-invitations'),
					cacheKey: `listUserInvitations`
				}),
			useListMembers: (params) =>
				useAuthData({
					queryFn: () =>
						authClient.$fetch(
							`/organization/list-members?organizationId=${params?.query?.organizationId || ''}`
						),
					cacheKey: `listMembers:${JSON.stringify(params)}`
				})
		};
	});

	// Merge view paths
	const viewPaths = $derived({ ...authViewPaths, ...viewPathsProp });

	// Merge localization
	const localization = $derived({ ...authLocalization, ...localizationProp });

	// Merge hooks
	const hooks = $derived({ ...defaultHooks, ...hooksProp });

	// Merge mutators
	const mutators = $derived({ ...defaultMutators, ...mutatorsProp });

	// Process basePath and baseURL (remove trailing slashes)
	const basePath = $derived(
		(basePathProp.endsWith('/') ? basePathProp.slice(0, -1) : basePathProp) === '/'
			? ''
			: basePathProp.endsWith('/')
				? basePathProp.slice(0, -1)
				: basePathProp
	);
	const baseURL = $derived(baseURLProp.endsWith('/') ? baseURLProp.slice(0, -1) : baseURLProp);

	// Get session data
	const sessionStore = authClient.useSession();
	const sessionData = $derived(sessionStore.data);

	// Set the context for child components - wrapped in $effect to capture reactive values
	$effect(() => {
		setAuthUIConfig({
			authClient,
			additionalFields,
			apiKey,
			avatar,
			basePath,
			baseURL,
			captcha,
			redirectTo: redirectToProp,
			changeEmail,
			credentials,
			deleteUser,
			emailVerification,
			emailOTP,
			freshAge,
			genericOAuth,
			gravatar,
			hooks,
			magicLink,
			multiSession,
			mutators,
			localization,
			nameRequired,
			oneTap,
			optimistic,
			organization,
			passkey,
			persistClient,
			account,
			signUp,
			social,
			toast: toastProp || defaultToast,
			twoFactor,
			navigate: navigateProp || defaultNavigate,
			onSessionChange,
			replace: replaceProp || navigateProp || defaultReplace,
			viewPaths,
			Link: LinkProp || DefaultLink,
			theme,
			...props
		});
	});
</script>

{#if sessionData && organization}
	<OrganizationRefetcher />
{/if}

{#if captcha?.provider === 'google-recaptcha-v3'}
	<RecaptchaV3>
		{@render children()}
	</RecaptchaV3>
{:else}
	{@render children()}
{/if}
