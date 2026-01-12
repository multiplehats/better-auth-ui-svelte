---
"better-auth-ui-svelte": minor
---

Add "Edit Organization" feature to admin organizations table.

Admins can now edit organizations directly from the admin dashboard, including:
- Organization name
- Organization slug
- Organization logo (with image upload support)

The edit dialog follows existing patterns and supports custom upload handlers configured via `AuthUIProvider`.
