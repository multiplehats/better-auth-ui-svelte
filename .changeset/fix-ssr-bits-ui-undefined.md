---
"better-auth-ui-svelte": patch
---

Fix SSR error "Cannot read properties of undefined (reading 'Sub')" by replacing bits-ui primitive imports with local component wrappers. This eliminates the need for users to configure `ssr.noExternal` in their vite.config and resolves runtime errors during server-side rendering.
