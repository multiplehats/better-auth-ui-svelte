---
"better-auth-ui-svelte": patch
---

Fix infinite reactive loops in organization name form and change email card by wrapping `form.setFieldValue()` calls in `untrack()` within `$effect` blocks
