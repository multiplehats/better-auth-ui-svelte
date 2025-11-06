/**
 * Auth localization strings
 * These can be overridden by passing a localization object to AuthUIProvider
 */
export const authLocalization = {
	// General
	APP: 'App',
	ACCOUNT: 'Account',
	ACCOUNTS: 'Accounts',
	CANCEL: 'Cancel',
	SAVE: 'Save',
	DELETE: 'Delete',
	LOADING: 'Loading...',
	ERROR: 'Error',
	SUCCESS: 'Success',

	// Sign In
	SIGN_IN: 'Sign In',
	SIGN_IN_WITH: 'Sign in with',
	EMAIL: 'Email',
	EMAIL_PLACEHOLDER: 'email@example.com',
	EMAIL_REQUIRED: 'Email is required',
	EMAIL_INVALID: 'Email is invalid',
	PASSWORD: 'Password',
	PASSWORD_PLACEHOLDER: 'Password',
	PASSWORD_REQUIRED: 'Password is required',
	PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
	REMEMBER_ME: 'Remember me',
	FORGOT_PASSWORD: 'Forgot password?',
	SIGN_IN_SUCCESS: 'Signed in successfully',

	// Sign Up
	SIGN_UP: 'Sign Up',
	ALREADY_HAVE_ACCOUNT: 'Already have an account?',
	CREATE_ACCOUNT: 'Create Account',
	NAME: 'Name',
	NAME_PLACEHOLDER: 'Your name',
	NAME_REQUIRED: 'Name is required',
	CONFIRM_PASSWORD: 'Confirm Password',
	CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm Password',
	CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
	PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
	SIGN_UP_SUCCESS: 'Account created successfully',

	// User
	PROFILE: 'Profile',
	SETTINGS: 'Settings',
	SIGN_OUT: 'Sign Out',
	SIGNED_OUT: 'Signed out successfully',

	// Account Settings
	UPDATE_PROFILE: 'Update Profile',
	UPDATE_NAME: 'Update Name',
	UPDATE_EMAIL: 'Update Email',
	UPDATE_AVATAR: 'Update Avatar',
	DELETE_ACCOUNT: 'Delete Account',
	DELETE_ACCOUNT_CONFIRM: 'Are you sure you want to delete your account?',
	DELETE_ACCOUNT_SUCCESS: 'Account deleted successfully',

	// Security
	CHANGE_PASSWORD: 'Change Password',
	CURRENT_PASSWORD: 'Current Password',
	CURRENT_PASSWORD_REQUIRED: 'Current password is required',
	NEW_PASSWORD: 'New Password',
	NEW_PASSWORD_REQUIRED: 'New password is required',
	CHANGE_PASSWORD_SUCCESS: 'Password changed successfully',
	SESSIONS: 'Sessions',
	TWO_FACTOR: 'Two-Factor Authentication',
	ENABLE_TWO_FACTOR: 'Enable Two-Factor',
	DISABLE_TWO_FACTOR: 'Disable Two-Factor',

	// Organizations
	ORGANIZATION: 'Organization',
	ORGANIZATIONS: 'Organizations',
	CREATE_ORGANIZATION: 'Create Organization',
	ORGANIZATION_NAME: 'Organization Name',
	ORGANIZATION_SLUG: 'Organization Slug',
	MEMBERS: 'Members',
	INVITE_MEMBER: 'Invite Member',
	REMOVE_MEMBER: 'Remove Member',

	// Errors
	SOMETHING_WENT_WRONG: 'Something went wrong',
	INVALID_CREDENTIALS: 'Invalid email or password',
	EMAIL_ALREADY_EXISTS: 'Email already exists',
	USER_NOT_FOUND: 'User not found',
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden'
} as const;

export type AuthLocalization = typeof authLocalization;
