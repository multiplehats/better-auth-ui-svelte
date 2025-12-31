---
"better-auth-ui-svelte": minor
---

Add comprehensive admin dashboard and management components for Better Auth admin plugin. New features include:

- **AdminView**: Main admin interface with tabbed navigation (Dashboard, Users, Organizations)
- **AdminDashboard**: Overview dashboard with stats cards, user growth chart, and preview tables
- **UsersAdminTable**: Full-featured user management table with impersonation, banning, role updates, and more
- **OrganizationsAdminTable**: Organization management table with member viewing and admin actions
- **Admin Dialogs**: Complete set of dialogs for user/org management (ban, role updates, impersonate, delete, etc.)

Features:
- Skeleton loading states for better UX
- Configurable table limits and "View All" navigation
- Chart visualization for user growth with time range filters
- Zero-data states for empty charts
- Tab-based navigation with max-width constraints
- Full TypeScript support with proper type exports
