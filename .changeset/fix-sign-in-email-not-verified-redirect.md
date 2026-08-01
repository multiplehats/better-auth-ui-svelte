---
'better-auth-ui-svelte': patch
---

Redirect to the verify-email view when sign-in fails with `EMAIL_NOT_VERIFIED`.

Previously, signing in with an unverified account only showed a transient
"Email not verified" toast and rethrew, leaving no way to re-request the
verification email from the sign-in page. The sign-up flow already
forwarded to `/verify-email` (which exposes a working "Resend Verification
Email" button), but the sign-in path never did.

Now, when `authClient.signIn.email` rejects with `EMAIL_NOT_VERIFIED`
(and email verification is configured), the form navigates to the
verify-email view instead of toasting — mirroring the sign-up flow and the
existing 2FA redirect handling.

- Gates on a truthy `emailVerification` config so both `true` and the
  object form trigger the redirect (matching `sign-up-form.svelte`).
- Only appends `?email=<value>` when the entered value is a valid email;
  with username sign-in the value may be a username, which the
  verify-email view can't use, so it navigates without the param.
