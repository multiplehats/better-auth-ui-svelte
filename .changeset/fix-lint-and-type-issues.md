---
'better-auth-ui-svelte': patch
---

Resolve all ESLint errors, svelte-check warnings, and prettier issues.

Clean up the codebase to pass `eslint .`, `prettier --check .`, and
`svelte-check` with zero errors and zero warnings:

- Remove 18 `as any` casts in `auth-ui-provider.svelte` by wrapping
  queryFns to normalize better-auth response shapes and using proper
  `AuthHook<T>` type casts
- Fix 101 `state_referenced_locally` warnings via proper reactivity:
  `$derived` for schemas that read `localization`, getter functions
  for `useCaptcha`/`useOnSuccessTransition`, `untrack` for init-only
  captures
- Fix TanStack Form `FieldLikeAPI.state` → `store.state` migration
- Fix `no-navigation-without-resolve` by removing `resolve()` casts
  from generic UI primitives and using proper `goto()` with query strings
- Remove unused props from interfaces (`callbackURL`, `passkey.name`,
  `localization`, `optimistic`)
- Add missing `bind:this` on refs in chart-tooltip, sidebar-trigger, app-sidebar
- Delete dead vendored demo files (`nav-documents.svelte`,
  `nav-secondary.svelte`, `app-sidebar.svelte`, `data-table*.svelte`)
- Add explicit `ErrorContext` typing to `onError` callbacks
- Fix `<svelte:component>` deprecation in organizations-admin-table
- Add `role="presentation"` to team-cell stop-propagation div
