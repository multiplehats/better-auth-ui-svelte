# better-auth-ui-svelte

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
