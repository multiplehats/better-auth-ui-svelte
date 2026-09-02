---
'better-auth-ui-svelte': patch
---

Fix `AuthCallback` swallowing errors and re-invoking `useSession` per call.

Resolve `config.hooks.useSession?.()` once at component init instead of
inside the async `onSuccess` callback, and wrap each `onSuccess()` call
from the `$effect` in `.catch` so failures surface as a toast instead
of becoming unhandled rejections.
