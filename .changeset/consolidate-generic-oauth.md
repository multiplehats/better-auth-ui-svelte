---
'better-auth-ui-svelte': minor
---

Upgrade to better-auth v1.7.0-rc.1 and consolidate generic OAuth into unified social providers.

**Dependency updates:**

- `better-auth` ^1.6.23 → ^1.7.0-rc.1
- `@better-auth/api-key` ^1.6.23 → ^1.7.0-rc.1
- `@better-auth/passkey` ^1.6.23 → ^1.7.0-rc.1

**Fixes for v1.7.0 API changes:**

- Removed `genericOAuthClient` plugin from the auth client (removed in
  better-auth v1.7.0 — generic OAuth providers are now registered as
  standard social providers)
- Fixed `fromStore` type inference by extracting a `StoreLike<T>` type
  so that `session.value` correctly resolves instead of `{}`
- Fixed two-factor discriminated union narrowing by checking
  `response.method === 'totp'` before accessing `backupCodes`/`totpURI`
- Fixed `any-auth-client.ts` to use `typeof authClient` instead of
  referencing unimported `createAuthClient`

**Consolidation of generic OAuth into social providers:**

better-auth v1.7.0 removed the `genericOAuthClient` plugin — generic OAuth
providers now use the standard `signIn.social` and `linkSocial` APIs. This
change eliminates the separate generic OAuth system entirely:

- **Removed** the `genericOAuth` prop from `AuthUIProvider` — use `social`
  instead
- **Removed** `GenericOAuthOptions` type and `src/lib/types/generic-oauth-options.ts`
- **Removed** the `other` prop from `ProviderButton` — all providers now use
  the same sign-in path
- **Changed** `SocialOptions.providers` from `SocialProvider[]` (strings) to
  `Provider[]` (objects with `provider`, `name`, and optional `icon`)
- **Consolidated** duplicate `Provider` types and `socialProviders` arrays
  into a single definition in `src/lib/social-providers.ts`
- **Removed** the `genericOAuth` plugin from the demo server config — custom
  OAuth providers should now be registered directly in `socialProviders` on
  the server

**Migration:**

Before:

```svelte
<AuthUIProvider
  social={{ providers: ['google', 'github'] }}
  genericOAuth={{ providers: [{ provider: 'custom', name: 'Custom' }] }}
>
```

After:

```svelte
<AuthUIProvider
  social={{
    providers: [
      { provider: 'google', name: 'Google' },
      { provider: 'github', name: 'GitHub' },
      { provider: 'custom', name: 'Custom' }
    ]
  }}
>
```
