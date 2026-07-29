---
'better-auth-ui-svelte': patch
---

Surface accept-invitation errors inline instead of silently redirecting.

`AcceptInvitationInner` redirected to `redirectTo` (default `/join`)
whenever the invitation couldn't be loaded, making it impossible for the
user to tell why acceptance failed. The redirect also tore down the
component before any toast could be noticed.

Now the card stays on screen and shows a specific inline message based
on the HTTP status of the `getInvitation` error: 403 (recipient
mismatch — the active user's email differs from the invited email) vs
400 (not found / expired). The redirect is removed for all error cases.

Note: better-auth's organization error codes are passed to
`APIError.from` as plain strings rather than `{ code, message }`
objects, so the 403 response body serializes without a usable `code`.
The HTTP status is the only reliable differentiator.
