---
'better-auth-ui-svelte': patch
---

Fix `ForgotPasswordForm` bypassing `config.navigate` after submitting.

The form redirected via `window.location.href` after a successful reset
request, forcing a full document reload and skipping the host's
client-side router. Use `config.navigate(...)` to match the rest of
the library.
