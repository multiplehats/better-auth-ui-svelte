---
"better-auth-ui-svelte": minor
---

Add Teams UI to OrganizationView

- New "Teams" tab in OrganizationView with full team CRUD (create, rename, delete)
- Inline accordion expansion to view and manage team members
- Add/remove team members from existing org members or invite by email
- Extensibility callback props (`filterTeams`, `canCreateTeam`, `canDeleteTeam`, `canManageMembers`, `filterMembers`, `canRemoveMember`) for consumers to customize permissions
- New `useListTeams` and `useListTeamMembers` hooks with default implementations
- Enable via `organization.teams: true` in AuthUIProvider config
- 10 new exported components: `OrganizationTeamsCard`, `TeamCell`, `TeamMemberCell`, `TeamMembersPanel`, `CreateTeamDialog`, `UpdateTeamDialog`, `DeleteTeamDialog`, `AddTeamMemberDialog`, `RemoveTeamMemberDialog`
