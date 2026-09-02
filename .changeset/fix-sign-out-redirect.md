---
'better-auth-ui-svelte': patch
---

Fix `SignOut` redirecting to the sign-in page even when `signOut` failed.

`authClient.signOut().finally(onSuccess)` fires the redirect regardless
of whether `signOut` succeeded or threw. Use try/catch around
`signOut({ fetchOptions: { throw: true } })` and only call `onSuccess`
on success; surface a localized toast on failure. The `signingOut`
state is dropped entirely — the dead `onMount` guard that read it was
the only consumer.
