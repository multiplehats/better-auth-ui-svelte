---
"better-auth-ui-svelte": patch
---

Fix TypeScript declaration generation errors and SSR import issues:
- Add explicit type annotations to `socialProviders`, `authClient`, `useSession`, and dropdown menu exports to resolve `.d.ts` generation errors
- Configure Vite SSR to properly handle `bits-ui` Svelte components during server-side rendering
