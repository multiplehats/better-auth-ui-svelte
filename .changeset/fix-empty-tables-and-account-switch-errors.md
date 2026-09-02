---
'better-auth-ui-svelte': patch
---

Fix intermittent empty Accounts/Sessions tables and has-permission 401 errors during account switches.

**`useAuthData` (`use-auth-data.svelte.ts`):**

- Add `syncFromCache()` called immediately on subscribe, so a remount with warm (non-stale) cache populates `data` right away instead of showing an empty list until the next cache mutation.
- Add a `cancelled` flag set on component unmount; in-flight `refetch` results suppress error toasts when the consuming component is gone, while still updating the shared cache so remounted components see fresh data.

**AuthUIProvider (`auth-ui-provider.svelte`):**

- Clear the entire `authDataCache` when the signed-in user changes, ensuring hooks like `useListDeviceSessions` show fresh data even when their consuming components (e.g. the sidebar's UserButton) were unmounted during the sign-in flow.

**Organization view (`organization-view.svelte`):**

- Gate the org sub-components (MembersCard, SettingsCards, TeamsCard) on a resolved `organization`; show a loading skeleton while the org is null/stale. This unmounts the sub-components (and their `useHasPermission` hooks) during an account switch before they can fire against a stale org.

**Organization refetcher (`organization-refetcher.svelte`):**

- On user-id change, clear the active-org atom to `{ data: null, isPending: true }` in a `$effect.pre` (runs before regular `$effect`s), so the org view unmounts before `useHasPermission` effects refire.
- Refetch the active org and org list for the new user.

**`useHasPermission` (`auth-ui-provider.svelte`):**

- The queryFn now checks `useActiveOrganization().get()` before calling has-permission; if the active org is null, it returns `{ success: false }` without making the network call, preventing 401s during the transition window.
