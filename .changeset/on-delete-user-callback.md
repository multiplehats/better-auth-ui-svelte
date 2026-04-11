---
"better-auth-ui-svelte": patch
---

Wire up `onDeleteUser` callback in `UsersAdminTable`

When provided, the `onDeleteUser` callback is used instead of the default `authClient.admin.removeUser()` for both single and bulk user deletion. This allows consumers to implement soft-delete or custom deletion logic.
