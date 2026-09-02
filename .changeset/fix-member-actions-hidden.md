---
'better-auth-ui-svelte': patch
---

Fix organization members page hiding edit/remove actions for all roles.

`OrganizationMembersInner` and `MemberCell` called `useHasPermission` with
`permission:` (singular) instead of `permissions:` (plural). The
`/organization/has-permission` endpoint only reads `ctx.body.permissions`;
the singular `permission` field is deprecated and ignored, so
`hasPermissionFn` always received `undefined` and returned `false`.
This hid the edit-role and remove-member actions for every user —
including org owners. Also corrects the `useHasPermission` type
signature so this can't recur.
