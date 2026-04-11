# better-auth-ui-svelte

## 0.12.0

### Minor Changes

- Add `organizationId` prop to OrganizationView to override the session's active organization for all internal API calls ([#25](https://github.com/multiplehats/better-auth-ui-svelte/pull/25))

### Patch Changes

- Wire up `onDeleteUser` callback in `UsersAdminTable` ([#25](https://github.com/multiplehats/better-auth-ui-svelte/pull/25))

  When provided, the `onDeleteUser` callback is used instead of the default `authClient.admin.removeUser()` for both single and bulk user deletion. This allows consumers to implement soft-delete or custom deletion logic.

## 0.11.0

### Minor Changes

- Add `additionalOrganizations` prop to `OrganizationSwitcher` ([#23](https://github.com/multiplehats/better-auth-ui-svelte/pull/23))

  Allows consumers to render extra organization groups in the switcher dropdown — useful for agency/multi-tenant apps where users manage organizations they aren't direct members of.

  The new prop accepts a `label`, `items` array, and an `onSelect` callback that fires instead of `setActiveOrganization`, giving full control over navigation behavior.

## 0.10.0

### Minor Changes

- Add Teams UI to OrganizationView ([`ed9c178`](https://github.com/multiplehats/better-auth-ui-svelte/commit/ed9c1782583a937ec0b68ccd76f5e7a60f48158c))
  - New "Teams" tab in OrganizationView with full team CRUD (create, rename, delete)
  - Inline accordion expansion to view and manage team members
  - Add/remove team members from existing org members or invite by email
  - Extensibility callback props (`filterTeams`, `canCreateTeam`, `canDeleteTeam`, `canManageMembers`, `filterMembers`, `canRemoveMember`) for consumers to customize permissions
  - New `useListTeams` and `useListTeamMembers` hooks with default implementations
  - Enable via `organization.teams: true` in AuthUIProvider config
  - 10 new exported components: `OrganizationTeamsCard`, `TeamCell`, `TeamMemberCell`, `TeamMembersPanel`, `CreateTeamDialog`, `UpdateTeamDialog`, `DeleteTeamDialog`, `AddTeamMemberDialog`, `RemoveTeamMemberDialog`

## 0.9.2

### Patch Changes

- Fix crash in organization-refetcher when session data lacks user property ([`dedfbf0`](https://github.com/multiplehats/better-auth-ui-svelte/commit/dedfbf08ae93b685345ffc9805803451095cc95b))

  The onboarding plugin can replace the session response with `{ onboardingRedirect: true }`, which has no `user` property. `sessionData?.user.id` crashes with "Cannot read properties of undefined (reading 'id')". Added optional chaining: `sessionData?.user?.id`.

## 0.9.1

### Patch Changes

- fix: don't redirect to verify-email view when `emailVerification` is disabled ([`7602e36`](https://github.com/multiplehats/better-auth-ui-svelte/commit/7602e361a62f0fb33b2d9e31d36556b7af2c719a))

  Previously, after sign-up the UI would always redirect to the verify-email view when the server response didn't contain a token, regardless of the `emailVerification` config. Now, when `emailVerification` is falsy, the sign-up is treated as successful instead.

## 0.9.0

### Minor Changes

- Add `menuItems` snippet prop to `UserButton` ([`b597efe`](https://github.com/multiplehats/better-auth-ui-svelte/commit/b597efe3b55d6668302ffbff445041b8a0771e07))

  Renders custom `DropdownMenu` items (preceded by a separator) above the sign-out entry, enabling callers to inject any non-link content — e.g. a language switcher, theme toggle, or other action items — directly inside the user dropdown.

  ```svelte
  <UserButton>
  	{#snippet menuItems()}
  		<DropdownMenu.Item onclick={toggleLanguage}>🌐 Language</DropdownMenu.Item>
  	{/snippet}
  </UserButton>
  ```

## 0.8.3

### Patch Changes

- fix(organization): members and accept-invitation not loading due to hooks called inside $derived ([`f264758`](https://github.com/multiplehats/better-auth-ui-svelte/commit/f2647581d21f13f5281474279ec70ed031718e53))

## 0.8.2

### Patch Changes

- fix(organization): invitations not loading until tab switch due to $effect inside $derived ([`fc1de6e`](https://github.com/multiplehats/better-auth-ui-svelte/commit/fc1de6eda3a55e1e733fe808fbb7556e09a3f002))

## 0.8.1

### Patch Changes

- fix(nl): replace "magische link" with "inloglink" for more natural Dutch UX ([`d8c726c`](https://github.com/multiplehats/better-auth-ui-svelte/commit/d8c726c22698fb2cfd642f314416da387cc4c207))

## 0.8.0

### Minor Changes

- Add Dutch (Nederlands) localization (`nlLocalization`) ([`ebc7ad6`](https://github.com/multiplehats/better-auth-ui-svelte/commit/ebc7ad6e5234b189b93af289912b8e414ecdaf7f))

## 0.7.0

### Minor Changes

- Add custom fetch support for admin organizations ([`b3b65a3`](https://github.com/multiplehats/better-auth-ui-svelte/commit/b3b65a3c772868d8e0297987edb5eab79e59cbd6))

### Patch Changes

- Fix infinite reactive loops in organization name form and change email card by wrapping `form.setFieldValue()` calls in `untrack()` within `$effect` blocks ([`b3b65a3`](https://github.com/multiplehats/better-auth-ui-svelte/commit/b3b65a3c772868d8e0297987edb5eab79e59cbd6))

## 0.6.3

### Patch Changes

- Add `fromStore` utility ([`6e82386`](https://github.com/multiplehats/better-auth-ui-svelte/commit/6e82386cbe152c123f1d6308947e9c42fa875848))

## 0.6.2

### Patch Changes

- Add `default` export condition to fix Rollup resolution errors during SSR builds on Vercel ([`0f174f5`](https://github.com/multiplehats/better-auth-ui-svelte/commit/0f174f59c51cd48594507c667ddec7f6b67dab23))

## 0.6.1

### Patch Changes

- feat: add organizationCustomActions prop to AdminView ([`331fcb7`](https://github.com/multiplehats/better-auth-ui-svelte/commit/331fcb72c4f68b06f39e9a83f4b2c3a5220c844a))
  - Added `organizationCustomActions` prop to `AdminViewProps` type to allow passing custom dropdown menu actions for the organizations table
  - Updated `AdminView` component to pass through custom actions to `OrganizationsAdminTable`
  - Custom actions can now be passed via `AdminView` (using `organizationCustomActions` prop) or `AdminDashboard` (using `orgsTableProps.customActions`)

- fix: resolve state_referenced_locally warnings in Svelte 5 components ([`331fcb7`](https://github.com/multiplehats/better-auth-ui-svelte/commit/331fcb72c4f68b06f39e9a83f4b2c3a5220c844a))

  Fixed reactivity warnings in multiple components by using `$derived` for merged localization objects and ensuring proper variable declaration ordering.

  Key fixes:
  - Auth forms now use `$derived` for merged localization (sign-in, sign-up, forgot-password, magic-link, two-factor, email-otp)
  - User components use reactive localization merging (user-avatar, user-button, user-view)
  - Organization components (organization-cell-view, organization-logo, organizations-card, create-organization-dialog, personal-account-view)
  - Settings components (accounts-card, account-cell, update-avatar-card, update-name-card, update-username-card, delete-account-card, delete-account-dialog, providers-card, provider-cell, two-factor-card)
  - Other components (auth-ui-provider, recaptcha-badge, qr-code)

- Remove padding from admin dashboard chart and tables sections for more flexible layout control. ([`4b43a8a`](https://github.com/multiplehats/better-auth-ui-svelte/commit/4b43a8a944de4fe1a634001a4e3b98644e398ac7))

## 0.5.0

### Minor Changes

- Add "Edit Organization" feature and custom actions support to admin organizations table. ([`f41f77c`](https://github.com/multiplehats/better-auth-ui-svelte/commit/f41f77cf1d7866b836052ab91ce84fc18c997c99))

  **Edit Organization:**
  Admins can now edit organizations directly from the admin dashboard, including:
  - Organization name
  - Organization slug
  - Organization logo (with image upload support)

  **Custom Actions:**
  The organizations table now supports a `customActions` prop to add your own dropdown menu items:

  ```svelte
  <OrganizationsAdminTable
  	customActions={[
  		{
  			label: 'View Analytics',
  			icon: BarChart,
  			onClick: (org) => goto(`/analytics/${org.id}`)
  		},
  		{
  			label: 'Archive',
  			variant: 'destructive',
  			onClick: (org) => archiveOrg(org.id),
  			show: (org) => !org.metadata?.archived
  		}
  	]}
  />
  ```

  Each action supports: `label`, `icon` (Lucide icon), `onClick`, `variant` ('default' | 'destructive'), and `show` (conditional visibility).

### Patch Changes

- Add configurable `adminBasePath` option to AuthUIProvider for customizing admin route paths. ([`096c4c8`](https://github.com/multiplehats/better-auth-ui-svelte/commit/096c4c807d63471db0dad4fa37b7f50c51d8dde5))

  Previously, admin navigation links were hardcoded to `/app/admin/*`. Now you can configure where your admin routes live:

  ```svelte
  <AuthUIProvider {authClient} adminBasePath="/admin">
  	<!-- your app -->
  </AuthUIProvider>
  ```

  This allows apps that host admin at different paths (e.g., `/admin` instead of `/app/admin`) to have correct navigation links in the admin dashboard and admin view components.

## 0.4.0

### Minor Changes

- Add comprehensive admin dashboard and management components for Better Auth admin plugin. New features include: ([`2c58507`](https://github.com/multiplehats/better-auth-ui-svelte/commit/2c5850785d000de1b230e5d4014789300c92a1ef))
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

## 0.3.8

### Patch Changes

- Fix SSR error "Cannot read properties of undefined (reading 'Sub')" by replacing bits-ui primitive imports with local component wrappers. This eliminates the need for users to configure `ssr.noExternal` in their vite.config and resolves runtime errors during server-side rendering. ([`edefbef`](https://github.com/multiplehats/better-auth-ui-svelte/commit/edefbef6c840a1269345cbe6fb8759d1d92e4f07))

## 0.3.7

### Patch Changes

- Fix linter and TypeScript errors/warnings across the codebase to improve code quality and type safety ([`a468864`](https://github.com/multiplehats/better-auth-ui-svelte/commit/a46886460621faff7f59b0aedfeee874561bc83b))

## 0.3.6

### Patch Changes

- Fix SSR hydration errors caused by nested button elements in bits-ui trigger components: ([`056224f`](https://github.com/multiplehats/better-auth-ui-svelte/commit/056224f91f7fc9c8b8eac86a57fab62d76a86d94))
  - Fix nested buttons in `account-view.svelte` and `organization-view.svelte` Drawer.Trigger components
  - Fix nested buttons in `account-cell.svelte`, `sign-up-form.svelte`, and `invitation-cell.svelte` DropdownMenu.Trigger components
  - Apply proper `{#snippet child({ props })}` pattern to prevent invalid HTML structure during SSR
  - Resolves `node_invalid_placement_ssr` warnings and hydration mismatches

## 0.3.5

### Patch Changes

- Fix TypeScript declaration generation errors and SSR import issues: ([`8ad6c58`](https://github.com/multiplehats/better-auth-ui-svelte/commit/8ad6c580f62ab9b204acdcc241d3218ad23273e1))
  - Add explicit type annotations to `socialProviders`, `authClient`, `useSession`, and dropdown menu exports to resolve `.d.ts` generation errors
  - Configure Vite SSR to properly handle `bits-ui` Svelte components during server-side rendering
