# better-auth-ui-svelte

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
