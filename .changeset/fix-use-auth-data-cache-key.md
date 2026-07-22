---
'better-auth-ui-svelte': patch
---

Warn in dev when `useAuthData` is called without an explicit `cacheKey`.

The `queryFn.toString()` fallback for the cache key is unsafe under
minification (mangled names can collide). Internal callers always pass
an explicit `cacheKey`; emit a dev-mode console warning to nudge
consumer callers toward the same pattern, rather than making the param
required.
