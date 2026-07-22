---
'better-auth-ui-svelte': patch
---

Fix `TwoFactorForm` auto-submit producing unhandled promise rejections.

The auto-submit `$effect` called `form.handleSubmit()` without a
`.catch`, so any rejection (the form's `onSubmit` already surfaces a
toast) propagated as an unhandled promise rejection. Attach a `.catch`.
