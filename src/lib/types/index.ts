import type { authLocalization } from '$lib/localization/auth-localization.js';
import type { Snippet } from 'svelte';
import type { AuthHooks } from './auth-hooks.js';
import type { AuthMutators } from './auth-mutators.js';
import type { AuthViewPaths } from '../utils/view-paths.js';
import type { AvatarOptions } from './avatar-options.js';
import type { AccountOptionsContext } from './account-options.js';
import type { OrganizationOptionsContext } from './organization-options.js';
import type { CaptchaOptions } from './captcha-options.js';
import type { CredentialsOptions } from './credentials-options.js';
import type { SignUpOptions } from './sign-up-options.js';
import type { SocialOptions } from './social-options.js';
import type { GenericOAuthOptions } from './generic-oauth-options.js';
import type { DeleteUserOptions } from './delete-user-options.js';
import type { GravatarOptions } from './gravatar-options.js';
import type { AdditionalFields } from './additional-fields.js';
import type { Link } from './link.js';
import type { RenderToast } from './render-toast.js';
import type { AuthClient } from './any-auth-client.js';

/**
 * Auth localization type
 */
export type AuthLocalization = typeof authLocalization;

/**
 * Common component props
 */
export interface BaseComponentProps {
	className?: string;
	classNames?: Record<string, string>;
}

/**
 * User type (from Better Auth)
 */
export interface User {
	id: string;
	email: string;
	emailVerified: boolean;
	name?: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	twoFactorEnabled?: boolean;
}

/**
 * Session type (from Better Auth)
 */
export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	token: string;
	ipAddress?: string;
	userAgent?: string;
}

/**
 * Auth UI configuration (context type)
 */
export interface AuthUIConfig {
	authClient: AuthClient;
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
	avatar?: AvatarOptions;
	/**
	 * Base path for the auth views
	 * @default "/auth"
	 */
	basePath: string;
	/**
	 * Front end base URL for auth API callbacks
	 */
	baseURL?: string;
	/**
	 * Captcha configuration
	 */
	captcha?: CaptchaOptions;
	credentials?: CredentialsOptions;
	/**
	 * Default redirect URL after authenticating
	 * @default "/"
	 */
	redirectTo: string;
	/**
	 * Enable or disable user change email support
	 * @default true
	 */
	changeEmail?: boolean;
	/**
	 * User Account deletion configuration
	 * @default undefined
	 */
	deleteUser?: DeleteUserOptions;
	/**
	 * Show Verify Email card for unverified emails
	 */
	emailVerification?: boolean;
	/**
	 * Freshness age for Session data
	 * @default 60 * 60 * 24
	 */
	freshAge: number;
	/**
	 * Generic OAuth provider configuration
	 */
	genericOAuth?: GenericOAuthOptions;
	/**
	 * Gravatar configuration
	 */
	gravatar?: boolean | GravatarOptions;
	hooks: AuthHooks;
	localization: typeof authLocalization;
	/**
	 * Enable or disable Magic Link support
	 * @default false
	 */
	magicLink?: boolean;
	/**
	 * Enable or disable Email OTP support
	 * @default false
	 */
	emailOTP?: boolean;
	/**
	 * Enable or disable Multi Session support
	 * @default false
	 */
	multiSession?: boolean;
	mutators: AuthMutators;
	/**
	 * Whether the name field should be required
	 * @default true
	 */
	nameRequired?: boolean;
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
	 * Organization configuration
	 */
	organization?: OrganizationOptionsContext;
	/**
	 * Enable or disable Passkey support
	 * @default false
	 */
	passkey?: boolean;
	/**
	 * Forces better-auth to refresh the Session on the auth callback page
	 * @default false
	 */
	persistClient?: boolean;
	/**
	 * Account configuration
	 */
	account?: AccountOptionsContext;
	/**
	 * Sign Up configuration
	 */
	signUp?: SignUpOptions;
	/**
	 * Social provider configuration
	 */
	social?: SocialOptions;
	toast: RenderToast;
	/**
	 * Enable or disable two-factor authentication support
	 * @default undefined
	 */
	twoFactor?: ('otp' | 'totp')[];
	viewPaths: AuthViewPaths;
	/**
	 * Navigate to a new URL
	 * @default window.location.href
	 */
	navigate: (href: string) => void;
	/**
	 * Called whenever the Session changes
	 */
	onSessionChange?: () => void | Promise<void>;
	/**
	 * Replace the current URL
	 * @default navigate
	 */
	replace: (href: string) => void;
	/**
	 * Custom Link component for navigation
	 * @default <a>
	 */
	Link: Link;
	/**
	 * Theme (light/dark)
	 */
	theme?: 'light' | 'dark';
}

/**
 * Form error type
 */
export interface FormError {
	field?: string;
	message: string;
}

/**
 * Common props for conditional components
 */
export interface ConditionalProps {
	children: Snippet;
}

// Re-export all types
export * from './additional-fields.js';
export * from './any-auth-client.js';
export * from './api-key.js';
export * from './auth-hooks.js';
export * from './auth-mutators.js';
export * from './avatar-options.js';
export * from './account-options.js';
export * from './captcha-options.js';
export * from './captcha-provider.js';
export * from './credentials-options.js';
export * from './delete-user-options.js';
export * from './generic-oauth-options.js';
export * from './gravatar-options.js';
export * from './image.js';
export * from './invitation.js';
export * from './link.js';
export * from './organization-options.js';
export * from './password-validation.js';
export * from './refetch.js';
export * from './render-toast.js';
export * from './sign-up-options.js';
export * from './social-options.js';
