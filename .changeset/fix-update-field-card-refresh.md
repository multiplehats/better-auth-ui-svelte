---
'better-auth-ui-svelte': patch
---

Fix `UpdateFieldCard` losing its value after a page refresh.

The sync `$effect` in `UpdateFieldCard` read the `value` prop _inside_
`untrack()`, which prevented Svelte from registering it as a dependency.
The effect therefore ran only once on mount and never re-ran when the
session finished loading, so any field backed by session data (e.g. the
Name card on the account-settings page) stayed empty after a refresh
while still working on initial client-side navigation (where the session
was already cached). Read `value` outside `untrack` and pass the
captured value into the untracked `setFieldValue` call so the effect
re-runs whenever the prop updates.
