---
'better-auth-ui-svelte': patch
---

Update all dependencies to latest stable and fix resulting issues.

**Dependency updates:**

- `better-auth` ^1.4.18 → ^1.6.23
- `@better-auth/passkey` ^1.4.18 → ^1.6.23
- `eslint` ^9.x → ^10.x
- `svelte` ^5.46 → ^5.56
- `vite` ^7.x → ^8.x
- `vitest` ^3.x → ^4.x
- `@tanstack/svelte-form` ^1.27 → ^1.33
- `layerchart` 2.0.0-next.48 → 2.0.2 (stable)
- `@lucide/svelte` ^0.561 → ^1.25
- Various other deps updated to latest

**Breaking changes for consumers:**

- `better-auth` peerDependency raised from `^1.4.18` to `^1.6.23`
- `@better-auth/api-key` added as optional peerDependency (was a
  transitive dep of `better-auth` in 1.4/1.5; moved to separate package
  in 1.6+). Consumers using the API key feature must install it.
- `@lucide/svelte` peerDependency raised from `^0.554.0` to `^1.0.0`
- `layerchart` peerDependency raised from `2.0.0-next.48` to `^2.0.0`

**Fixes for breaking changes in updated deps:**

- Import `apiKeyClient`/`apiKey` from `@better-auth/api-key` (moved
  out of `better-auth` core in 1.6+)
- Fix `no-useless-assignment` errors (new eslint 10 rule)
- Fix Vitest 4 config: remove `environment: 'browser'` (moved to
  `browser.enabled`)
- Fix TanStack Form 1.33 type changes (`FieldLikeAPI.state` →
  `store.state`)
- Add `ErrorContext` typing to `onError` callbacks
