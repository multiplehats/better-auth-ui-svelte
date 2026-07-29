---
'better-auth-ui-svelte': patch
---

Remount organization card inner components when the active org changes.

`OrganizationMembersCard` and `OrganizationInvitationsCard` pass the
resolved `organization` to their inner components, which call init-only
hooks (`useListMembers`, `useHasPermission`) at mount with the org id.
When the active org changed, the `organization` prop updated but Svelte
reused the same component instance — the init-only hooks kept the stale
org id, so members and permissions didn't refresh.

Wrap the inner components in `{#key organization.id}` so they remount
(and their hooks re-run) whenever the active org changes.
