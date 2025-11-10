// Components
export { default as AuthUIProvider } from './components/auth-ui-provider.svelte';
export { default as SignedIn } from './components/signed-in.svelte';
export { default as SignedOut } from './components/signed-out.svelte';
export { default as UserAvatar } from './components/user-avatar.svelte';
export { default as UserButton } from './components/user-button.svelte';
export { default as UserView } from './components/user-view.svelte';
export { default as AuthLoading } from './components/auth-loading.svelte';
export * as ProviderIcons from './components/provider-icons/index.js';
export { default as PasswordInput } from './components/password-input.svelte';
export { default as RedirectToSignIn } from './components/redirect-to-sign-in.svelte';
export { default as RedirectToSignUp } from './components/redirect-to-sign-up.svelte';

// Account Components
export * from './components/account/index.js';

// Auth Components
export { default as AuthCallback } from './components/auth/auth-callback.svelte';
export { default as AuthForm } from './components/auth/auth-form.svelte';
export { default as AuthView } from './components/auth/auth-view.svelte';
export { default as SignOut } from './components/auth/sign-out.svelte';
export { default as VerifyEmail } from './components/auth/verify-email.svelte';
export { default as MagicLinkSent } from './components/auth/magic-link-sent.svelte';

// Auth Forms
export { default as ForgotPasswordForm } from './components/auth/forms/forgot-password-form.svelte';
export { default as MagicLinkForm } from './components/auth/forms/magic-link-form.svelte';
export { default as RecoverAccountForm } from './components/auth/forms/recover-account-form.svelte';
export { default as ResetPasswordForm } from './components/auth/forms/reset-password-form.svelte';
export { default as SignInForm } from './components/auth/forms/sign-in-form.svelte';
export { default as SignUpForm } from './components/auth/forms/sign-up-form.svelte';
export { default as TwoFactorForm } from './components/auth/forms/two-factor-form.svelte';

// Form Utilities
export { default as FormError } from './components/form-error.svelte';
export type { FormErrorProps } from './components/form-error.svelte';

// Organization Components
// export { default as AcceptInvitationCard } from './components/organization/accept-invitation-card.svelte';
export { default as CreateOrganizationDialog } from './components/organization/create-organization-dialog.svelte';
export { default as DeleteOrganizationCard } from './components/organization/delete-organization-card.svelte';
export { default as DeleteOrganizationDialog } from './components/organization/delete-organization-dialog.svelte';
export { default as InvitationCell } from './components/organization/invitation-cell.svelte';
export { default as InviteMemberDialog } from './components/organization/invite-member-dialog.svelte';
export { default as LeaveOrganizationDialog } from './components/organization/leave-organization-dialog.svelte';
export { default as OrganizationCell } from './components/organization/organization-cell.svelte';
export { default as OrganizationCellView } from './components/organization/organization-cell-view.svelte';
export { default as OrganizationInvitationsCard } from './components/organization/organization-invitations-card.svelte';
export { default as OrganizationLogo } from './components/organization/organization-logo.svelte';
export { default as OrganizationLogoCard } from './components/organization/organization-logo-card.svelte';
export { default as OrganizationMembersCard } from './components/organization/organization-members-card.svelte';
export { default as OrganizationNameCard } from './components/organization/organization-name-card.svelte';
export { default as OrganizationSettingsCards } from './components/organization/organization-settings-cards.svelte';
export { default as OrganizationSlugCard } from './components/organization/organization-slug-card.svelte';
export { default as OrganizationSwitcher } from './components/organization/organization-switcher.svelte';
export { default as OrganizationView } from './components/organization/organization-view.svelte';
export { default as OrganizationsCard } from './components/organization/organizations-card.svelte';
export { default as RemoveMemberDialog } from './components/organization/remove-member-dialog.svelte';
export { default as MemberCell } from './components/organization/member-cell.svelte';
export { default as UpdateMemberRoleDialog } from './components/organization/update-member-role-dialog.svelte';
export { default as UserInvitationRow } from './components/organization/user-invitation-row.svelte';
export { default as UserInvitationsCard } from './components/organization/user-invitations-card.svelte';
export { default as PersonalAccountView } from './components/organization/personal-account-view.svelte';

// Settings Components - Account
export { default as AccountsCard } from './components/settings/account/accounts-card.svelte';
export { default as DeleteAccountCard } from './components/settings/account/delete-account-card.svelte';
export { default as UpdateAvatarCard } from './components/settings/account/update-avatar-card.svelte';
export { default as UpdateFieldCard } from './components/settings/account/update-field-card.svelte';
export { default as UpdateNameCard } from './components/settings/account/update-name-card.svelte';
export { default as UpdateUsernameCard } from './components/settings/account/update-username-card.svelte';
export { default as AccountSettingsCards } from './components/settings/account/account-settings-cards.svelte';

// Settings Components - API Key
export { default as ApiKeysCard } from './components/settings/api-key/api-keys-card.svelte';
export type { ApiKeysCardProps } from './components/settings/api-key/api-keys-card.svelte';

// Settings Components - Passkey
export { default as PasskeysCard } from './components/settings/passkey/passkeys-card.svelte';

// Settings Components - Providers
export { default as ProvidersCard } from './components/settings/providers/providers-card.svelte';
export type { ProvidersCardProps } from './components/settings/providers/providers-card.svelte';

// Settings Components - Security
export { default as ChangeEmailCard } from './components/settings/security/change-email-card.svelte';
export { default as ChangePasswordCard } from './components/settings/security/change-password-card.svelte';
export { default as SessionsCard } from './components/settings/security/sessions-card.svelte';
export { default as SecuritySettingsCards } from './components/settings/security-settings-cards.svelte';

// Settings Components - Shared
export { default as SettingsCard } from './components/settings/shared/settings-card.svelte';

// Settings Components - Skeletons
// export { default as InputFieldSkeleton } from './components/settings/skeletons/input-field-skeleton.svelte';
export { default as SettingsCellSkeleton } from './components/settings/skeletons/settings-cell-skeleton.svelte';

// Settings Components - Two Factor
export { default as TwoFactorCard } from './components/settings/two-factor/two-factor-card.svelte';

// Hooks
export * from './stores/use-auth-data.svelte.js';
export * from './hooks/use-authenticate.svelte.js';
export * from './hooks/use-current-organization.svelte.js';

// Lib
// export * from './lib/auth-ui-provider.js';
export * from './lib/social-providers.js';
export { getViewByPath } from './utils/utils.js';
export * from './utils/view-paths.js';

// Utilities
export { cn } from './utils/ui.js';
export * from './utils/get-paths.js';

// Context
export {
	getAuthUIConfig,
	getAuthClient,
	getLocalization
} from './context/auth-ui-config.svelte.js';

// Localization
export { authLocalization } from './localization/auth-localization.js';

// Types
export type { AuthUIConfig, User, Session, AuthLocalization } from './types/index.js';
export type { AuthFormClassNames } from './components/auth/auth-form.svelte';
export type { UserButtonClassNames } from './components/user-button.svelte';
export type { UserViewClassNames } from './components/user-view.svelte';
export type { UserAvatarClassNames } from './components/user-avatar.svelte';
export type { OrganizationSwitcherClassNames } from './components/organization/organization-switcher.svelte';
export type { OrganizationViewClassNames } from './components/organization/organization-cell-view.svelte';
export type { OrganizationLogoClassNames } from './components/organization/organization-logo.svelte';
export type { OrganizationLogoCardProps } from './components/organization/organization-logo-card.svelte';
export type { DeleteOrganizationCardProps } from './components/organization/delete-organization-card.svelte';
export type { OrganizationInvitationsCardProps } from './components/organization/organization-invitations-card.svelte';
export type { OrganizationMembersCardProps } from './components/organization/organization-members-card.svelte';
export type { OrganizationNameCardProps } from './components/organization/organization-name-card.svelte';
export type { OrganizationSettingsCardsProps } from './components/organization/organization-settings-cards.svelte';
export type { OrganizationSlugCardProps } from './components/organization/organization-slug-card.svelte';
export type { OrganizationViewProps } from './components/organization/organization-view.svelte';
export type { OrganizationsCardProps } from './components/organization/organizations-card.svelte';
export type { UserInvitationsCardProps } from './components/organization/user-invitations-card.svelte';
export type { SettingsCardClassNames } from './components/settings/shared/settings-card.svelte';
export * from './types/auth-hooks.js';
export * from './types/auth-mutators.js';
