---
"better-auth-ui-svelte": patch
---

Fix SSR hydration errors caused by nested button elements in bits-ui trigger components:
- Fix nested buttons in `account-view.svelte` and `organization-view.svelte` Drawer.Trigger components
- Fix nested buttons in `account-cell.svelte`, `sign-up-form.svelte`, and `invitation-cell.svelte` DropdownMenu.Trigger components
- Apply proper `{#snippet child({ props })}` pattern to prevent invalid HTML structure during SSR
- Resolves `node_invalid_placement_ssr` warnings and hydration mismatches
