---
'better-auth-ui-svelte': patch
---

Fix password validation and confirm password mismatch not showing.

Password length validation and confirm password mismatch errors were not
appearing in the Change Password card, sign-up form, or reset password form.

Three root causes were fixed:

1. **Missing `onChange` validators on Change Password card** — the
   `change-password-card.svelte` component validated only inside `onSubmit`
   via manual `safeParse`, so no live feedback appeared while typing.
   Added `validators={{ onChange: ... }}` to all three `<form.Field>`
   elements and replaced raw `{state.meta.errors[0]}` with
   `{getFieldError(state.meta.errors[0])}` for safe error rendering.

2. **Password mismatch only fired on submit** — the cross-field `.refine()`
   check (password === confirmPassword) lived on the top-level Zod object
   schema, so it only evaluated when the whole object was parsed. Added
   custom `confirmPassword` validators using `.superRefine()` + `.refine()`
   that check mismatch live, and `onChangeListenTo: ['newPassword']` /
   `['password']` so the confirm field re-validates when the password
   changes.

3. **Sign-in form applied password length validation** — the sign-in form
   used `getPasswordSchema()` for the password field, showing "password
   too short" warnings when entering an existing password. Replaced with a
   simple `z.string().min(1)` required-only check. The `currentPassword`
   field in the Change Password card was similarly fixed.

The Dutch localization (`nl.ts`) was also cleaned up to move
`PASSWORD_TOO_SHORT` / `PASSWORD_TOO_LONG` into their correct alphabetical
position (they were previously duplicated in the error codes section).
