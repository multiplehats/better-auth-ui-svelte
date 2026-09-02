---
'better-auth-ui-svelte': patch
---

Fix session not refetching after 2FA verify, causing redirect to sign-in.

`useOnSuccessTransition.onSuccess` called `hooks.useSession()` which
returns a nanostore atom, then checked `'refetch' in sessionHook` —
but `refetch` lives on the atom's **value** (accessed via `.get()`),
not on the atom object itself. The check always failed, so the session
was never refetched after 2FA verification.

The atom retained its stale pre-2FA state (`data: null`), so when
`onSuccess` navigated to a page guarded by `useAuthenticate` (e.g.
`accept-invitation`), the guard saw no session and bounced back to
the sign-in page.

This affected any flow using `useOnSuccessTransition` where the
authenticating action isn't in better-auth's `atomListeners` matcher
list (which includes `/sign-in/email` but not `/two-factor/verify-otp`).

Fix: access `refetch` via `sessionAtom.get().refetch` instead of
`sessionHook.refetch`.
