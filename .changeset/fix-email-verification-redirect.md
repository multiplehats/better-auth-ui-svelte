---
"better-auth-ui-svelte": patch
---

fix: don't redirect to verify-email view when `emailVerification` is disabled

Previously, after sign-up the UI would always redirect to the verify-email view when the server response didn't contain a token, regardless of the `emailVerification` config. Now, when `emailVerification` is falsy, the sign-up is treated as successful instead.
