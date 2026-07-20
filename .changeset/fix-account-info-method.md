---
"better-auth-ui-svelte": patch
---

Fix `useAccountInfo` issuing POST to GET-only `/account-info` endpoint.

The `useAccountInfo` hook passed `accountId` as a top-level body key instead of
inside `{ query: { ... } }`. The better-auth client proxy treats any non-empty
top-level body as a POST, but `/account-info` is registered as GET-only, so
every linked provider row in the account-settings page 404'd. The call now
wraps `accountId` in `{ query: { ... } }`, which makes the proxy issue GET as
expected.
