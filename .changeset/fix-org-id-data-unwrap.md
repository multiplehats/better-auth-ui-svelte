---
"better-auth-ui-svelte": patch
---

fix: `useCurrentOrganization` with `organizationId` now correctly returns the organization data

Better Auth's `getFullOrganization` endpoint returns the org as a flat object, not wrapped
in `{ organization: {...} }`. The hook was incorrectly accessing `.organization` on the
response, causing `OrganizationView` to never render when `organizationId` is provided.
