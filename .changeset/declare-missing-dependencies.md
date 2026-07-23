---
'better-auth-ui-svelte': patch
---

Declare missing runtime dependencies that were imported by shipped `dist/`
components but absent from `package.json`, causing consumer builds to fail
when resolving packages like `vaul-svelte`.

**Added to `dependencies`** (packages the library imports internally and
owns outright):

- `vaul-svelte` `1.0.0-next.7` — previously undeclared; consumers were
  incorrectly installing `0.x`, which transitively pulled
  `@melt-ui/svelte` (peer `svelte <5`) and triggered peer-dependency
  warnings. Declaring the 1.x version the library builds against resolves
  this entirely.
- `embla-carousel-svelte`, `formsnap`, `@tanstack/table-core`,
  `paneforge`, `tailwind-variants`, `clsx`, `tailwind-merge`,
  `@internationalized/date`, `sveltekit-superforms`,
  `@tabler/icons-svelte`, `drizzle-orm` — all imported by shipped `ui/*`
  primitives or server modules but never declared.

**Added to `peerDependencies`** (consumer-owned singletons/CSS pipeline):

- `svelte-sonner` — the app mounts `<Toaster />`; toasts must route to the
  single shared instance.
- `mode-watcher` — the app mounts `<ModeWatcher />`; the `mode` store
  must be coherent between app and library.
- `tw-animate-css` — provides `animate-in`/`fade-in-0`/`zoom-in-95`
  utilities used by dialog/drawer/overlay transition classes. Must be
  `@import`ed in the consuming app's global CSS.

**README** updated to document the `tw-animate-css` import requirement and
the singleton peer packages.
