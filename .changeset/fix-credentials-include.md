---
"better-auth-ui-svelte": patch
---

fix: add `credentials: 'include'` to `getFullOrganization` fetch in `useCurrentOrganization`

When `organizationId` is provided and the app runs cross-origin (e.g. SvelteKit app on :5173,
API on :3000), the `getFullOrganization` request was missing `credentials: 'include'`, so no
cookies were sent and the request returned 403.
