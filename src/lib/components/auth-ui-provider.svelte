<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setAuthUIConfig } from '$lib/context/auth-ui-config.svelte.js';
	import { authLocalization } from '$lib/localization/auth-localization.js';
	import { BASE_ERROR_CODES } from '$lib/localization/base-error-codes.js';
	import DefaultLink from './default-link.svelte';
	import RecaptchaV3 from './captcha/recaptcha-v3.svelte';
	import OrganizationRefetcher from './organization-refetcher.svelte';
	import type {
		AuthClient,
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
		authClient: AuthClient;
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
		emailVerification?:
			| boolean
			| {
					/**
					 * Cooldown period in seconds before allowing another verification email
					 * @default 60
					 */
					resendCooldown?: number;
					/**
					 * When true, redirects to verify-email page after clicking verification link
					 * instead of the main app. Useful when autoSignInAfterVerification in the server auth conrig is false
					 * in your server config, so users see a success message before signing in.
					 * @default false
					 */
					redirectToVerifyPage?: boolean;
			  };
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
		magicLink?:
			| boolean
			| {
					/**
					 * Cooldown period in seconds before allowing another magic link email
					 * @default 60
					 */
					resendCooldown?: number;
					/**
					 * When true, redirects to magic-link-sent page after requesting a magic link
					 * @default false
					 */
					redirectToSentPage?: boolean;
			  };
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
		 * Base path for the admin views
		 * @default "/admin"
		 */
		adminBasePath?: string;
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
		[key: string]: unknown;
	}

	let {
		children,
		authClient: authClientProp,
		account: accountProp,
		additionalFields,
		adminBasePath: adminBasePathProp = '/admin',
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

	const authClient = $derived(authClientProp);

	// Default navigation functions
	const defaultNavigate = (href: string) => {
		window.location.href = href;
	};

	const defaultReplace = (href: string) => {
		window.location.replace(href);
	};

	// Default toast implementation matching svelte-sonner's API
	const defaultToast: RenderToast = Object.assign(
		(message: string) => {
			console.log('[default]', message);
		},
		{
			success: (message: string) => {
				console.log('[success]', message);
			},
			error: (message: string) => {
				console.log('[error]', message);
			},
			warning: (message: string) => {
				console.log('[warning]', message);
			},
			info: (message: string) => {
				console.log('[info]', message);
			}
		}
	);

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
				}) as unknown,
			useAccountInfo: (params) =>
				useAuthData({
					queryFn: () => authClient.accountInfo({ accountId: params.providerId }),
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
					queryFn: () => authClient.organization.getInvitation({ query: params }),
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

	// Process emailVerification prop
	const emailVerificationConfig = $derived.by(() => {
		if (!emailVerification) return undefined;

		if (emailVerification === true) {
			return {
				enabled: true,
				resendCooldown: 60, // Default 60 seconds
				redirectToVerifyPage: false // Default false
			};
		}

		return {
			enabled: true,
			resendCooldown: emailVerification.resendCooldown || 60,
			redirectToVerifyPage: emailVerification.redirectToVerifyPage || false
		};
	});

	// Process basePath, adminBasePath, and baseURL (remove trailing slashes)
	const adminBasePath = $derived(
		adminBasePathProp.endsWith('/') ? adminBasePathProp.slice(0, -1) : adminBasePathProp
	);
	const basePath = $derived(
		(basePathProp.endsWith('/') ? basePathProp.slice(0, -1) : basePathProp) === '/'
			? ''
			: basePathProp.endsWith('/')
				? basePathProp.slice(0, -1)
				: basePathProp
	);
	const baseURL = $derived(baseURLProp.endsWith('/') ? baseURLProp.slice(0, -1) : baseURLProp);

	// Get session data
	// svelte-ignore state_referenced_locally -- authClient is stable and the session store is created once at initialization
	const sessionStore = authClient.useSession();
	const sessionData = $derived('data' in $sessionStore ? $sessionStore.data : undefined);

	// Create a reactive context object using getters to preserve reactivity
	// This ensures child components always access the current derived values
	const config = {
		get authClient() {
			return authClient;
		},
		get additionalFields() {
			return additionalFields;
		},
		get adminBasePath() {
			return adminBasePath;
		},
		get apiKey() {
			return apiKey;
		},
		get avatar() {
			return avatar;
		},
		get basePath() {
			return basePath;
		},
		get baseURL() {
			return baseURL;
		},
		get captcha() {
			return captcha;
		},
		get redirectTo() {
			return redirectToProp;
		},
		get changeEmail() {
			return changeEmail;
		},
		get credentials() {
			return credentials;
		},
		get deleteUser() {
			return deleteUser;
		},
		get emailVerification() {
			return emailVerificationConfig;
		},
		get emailOTP() {
			return emailOTP;
		},
		get freshAge() {
			return freshAge;
		},
		get genericOAuth() {
			return genericOAuth;
		},
		get gravatar() {
			return gravatar;
		},
		get hooks() {
			return hooks;
		},
		get magicLink() {
			return magicLink;
		},
		get multiSession() {
			return multiSession;
		},
		get mutators() {
			return mutators;
		},
		get localization() {
			return localization;
		},
		get nameRequired() {
			return nameRequired;
		},
		get oneTap() {
			return oneTap;
		},
		get optimistic() {
			return optimistic;
		},
		get organization() {
			return organization;
		},
		get passkey() {
			return passkey;
		},
		get persistClient() {
			return persistClient;
		},
		get account() {
			return account;
		},
		get signUp() {
			return signUp;
		},
		get social() {
			return social;
		},
		get toast() {
			return toastProp || defaultToast;
		},
		get twoFactor() {
			return twoFactor;
		},
		get navigate() {
			return navigateProp || defaultNavigate;
		},
		get onSessionChange() {
			return onSessionChange;
		},
		get replace() {
			return replaceProp || navigateProp || defaultReplace;
		},
		get viewPaths() {
			return viewPaths;
		},
		get Link() {
			return LinkProp || DefaultLink;
		},
		get theme() {
			return theme;
		},
		...props
	};

	// Set the context for child components synchronously
	setAuthUIConfig(config);

	// Handle error query parameters and show toast
	$effect(() => {
		if (typeof window === 'undefined') return;

		const searchParams = window.location.search ? new URL(window.location.href).searchParams : null;
		const errorCode = searchParams?.get('error');

		if (errorCode) {
			const errorMessage = BASE_ERROR_CODES[errorCode as keyof typeof BASE_ERROR_CODES];

			if (errorMessage) {
				const toast = toastProp || defaultToast;
				toast.error(errorMessage);
			}

			// Clean up the error parameter from the URL
			searchParams.delete('error');
			const newUrl = searchParams.toString()
				? `${window.location.pathname}?${searchParams.toString()}`
				: window.location.pathname;
			window.history.replaceState({}, '', newUrl);
		}
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
