---
"better-auth-ui-svelte": patch
---

fix: resolve state_referenced_locally warnings in Svelte 5 components

Fixed reactivity warnings across multiple components by using `$derived` for merged localization objects and other reactive values that were being captured at initialization time instead of staying reactive.

Affected components:
- Auth forms (sign-in, sign-up, forgot-password, magic-link, two-factor, email-otp)
- User components (user-avatar, user-button, user-view)
- Organization components (organization-cell-view, organization-logo, organizations-card, create-organization-dialog, personal-account-view)
- Settings components (accounts-card, account-cell, update-avatar-card, update-name-card, update-username-card, delete-account-card, delete-account-dialog, providers-card, provider-cell, change-password-card, session-cell, two-factor-card, create-api-key-dialog)
- Other components (auth-ui-provider, recaptcha-badge, qr-code)
