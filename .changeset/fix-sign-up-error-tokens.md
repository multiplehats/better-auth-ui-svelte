---
'better-auth-ui-svelte': patch
---

Fix `SignUpForm` using `text-red-500` instead of `text-destructive`.

Every other auth form uses the shadcn `text-destructive` token for field
errors; the sign-up form was the only one using `text-red-500`. Replace
all 10 occurrences with `text-destructive` for visual consistency.
