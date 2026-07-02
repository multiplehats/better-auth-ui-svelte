---
"better-auth-ui-svelte": patch
---

Fix the forgot-password form on better-auth 1.6+.

better-auth 1.6 removed the `forgetPassword` client method and its
`/forget-password` endpoint, renaming it to `requestPasswordReset` /
`/request-password-reset`. The forgot-password form still called
`forgetPassword`, so password resets returned 404 on better-auth 1.6. It now
calls `requestPasswordReset` (matching the settings change-password flow), and
the default captcha endpoints target `/request-password-reset`.
