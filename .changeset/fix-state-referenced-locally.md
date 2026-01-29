---
"better-auth-ui-svelte": patch
---

fix: resolve state_referenced_locally warnings in Svelte 5 components

Fixed reactivity warnings in multiple components by using `$derived` for merged localization objects and ensuring proper variable declaration ordering.

Key fixes:
- Auth forms now use `$derived` for merged localization (sign-in, sign-up, forgot-password, magic-link, two-factor, email-otp)
- User components use reactive localization merging (user-avatar, user-button, user-view)
- Organization components (organization-cell-view, organization-logo, organizations-card, create-organization-dialog, personal-account-view)
- Settings components (accounts-card, account-cell, update-avatar-card, update-name-card, update-username-card, delete-account-card, delete-account-dialog, providers-card, provider-cell, two-factor-card)
- Other components (auth-ui-provider, recaptcha-badge, qr-code)
