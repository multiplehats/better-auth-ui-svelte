---
"better-auth-ui-svelte": patch
---

Add configurable `adminBasePath` option to AuthUIProvider for customizing admin route paths.

Previously, admin navigation links were hardcoded to `/app/admin/*`. Now you can configure where your admin routes live:

```svelte
<AuthUIProvider
  authClient={authClient}
  adminBasePath="/admin"
>
  <!-- your app -->
</AuthUIProvider>
```

This allows apps that host admin at different paths (e.g., `/admin` instead of `/app/admin`) to have correct navigation links in the admin dashboard and admin view components.
