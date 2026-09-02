---
'better-auth-ui-svelte': patch
---

Upgrade to better-auth v1.7.0-rc.4.

**Dependency updates:**

- `better-auth` ^1.6.23 → ^1.7.0-rc.4
- `@better-auth/passkey` ^1.6.23 → ^1.7.0-rc.4

**Breaking changes for consumers:**

- `better-auth` peerDependency raised from `^1.6.23` to `^1.7.0-rc.4`
- `@better-auth/passkey` peerDependency raised from `^1.6.23` to
  `^1.7.0-rc.4`

**Fixes for breaking changes in better-auth 1.7:**

- Account selectors now use the local `account.id` instead of the
  provider-side `account.accountId` for `unlinkAccount` and
  `accountInfo`, per the 1.7 "account identity scoped by issuer" change.
- `unlinkAccount` no longer accepts `providerId`; `accountId` is now
  required (was previously optional).
- `useAccountInfo` hook params changed from `{ providerId: string }` to
  `{ accountId: string }`.
