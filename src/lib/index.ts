// Components
export { default as AuthUIProvider } from './components/auth-ui-provider.svelte';
export { default as SignedIn } from './components/signed-in.svelte';
export { default as SignedOut } from './components/signed-out.svelte';
export { default as UserAvatar } from './components/user-avatar.svelte';
export { default as UserButton } from './components/user-button.svelte';

// Auth Components
export { default as SignInForm } from './components/auth/sign-in-form.svelte';
export { default as SignUpForm } from './components/auth/sign-up-form.svelte';

// Utilities
export { createForm } from './utils/form.svelte.js';
export { cn } from './utils/ui.js';

// Context
export { getAuthUIConfig, getAuthClient, getLocalization } from './context/auth-ui-config.svelte.js';

// Localization
export { authLocalization } from './localization/auth-localization.js';

// Types
export type { AuthUIConfig, User, Session, AuthLocalization } from './types/index.js';
