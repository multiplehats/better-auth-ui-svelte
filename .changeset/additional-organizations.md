---
"better-auth-ui-svelte": minor
---

Add `additionalOrganizations` prop to `OrganizationSwitcher`

Allows consumers to render extra organization groups in the switcher dropdown — useful for agency/multi-tenant apps where users manage organizations they aren't direct members of.

The new prop accepts a `label`, `items` array, and an `onSelect` callback that fires instead of `setActiveOrganization`, giving full control over navigation behavior.
