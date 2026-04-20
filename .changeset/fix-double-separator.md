---
"better-auth-ui-svelte": patch
---

fix: remove double separator in OrganizationSwitcher when no orgs are listed above additional organizations

When `hidePersonal={true}` and the user has only one org (the active one), the always-present
separator and the `additionalOrganizations` separator appeared adjacent. The separator before
additional orgs now only renders when there are items above it.
