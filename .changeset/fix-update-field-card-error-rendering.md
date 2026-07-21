---
'better-auth-ui-svelte': patch
---

Fix `UpdateFieldCard` rendering `[object Object]` for validation errors.

The field-error rendering interpolated `state.meta.errors[0]` directly.
With Zod 4 the issue is an object, so an empty required field rendered
`[object Object]` in red instead of the message. Route the error through
the existing `getFieldError` helper (already used by every auth form) so
the `.message` is extracted.
