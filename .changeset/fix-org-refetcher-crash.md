---
"better-auth-ui-svelte": patch
---

Fix crash in organization-refetcher when session data lacks user property

The onboarding plugin can replace the session response with `{ onboardingRedirect: true }`, which has no `user` property. `sessionData?.user.id` crashes with "Cannot read properties of undefined (reading 'id')". Added optional chaining: `sessionData?.user?.id`.
