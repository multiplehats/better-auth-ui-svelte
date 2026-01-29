---
"better-auth-ui-svelte": patch
---

feat: add organizationCustomActions prop to AdminView

- Added `organizationCustomActions` prop to `AdminViewProps` type to allow passing custom dropdown menu actions for the organizations table
- Updated `AdminView` component to pass through custom actions to `OrganizationsAdminTable`
- Custom actions can now be passed via `AdminView` (using `organizationCustomActions` prop) or `AdminDashboard` (using `orgsTableProps.customActions`)
