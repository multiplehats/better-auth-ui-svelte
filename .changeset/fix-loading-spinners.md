---
"better-auth-ui-svelte": patch
---

Fix loading spinners not appearing on mutation buttons

- Fix `form.state.isSubmitting` being non-reactive in all form components — replaced with `form.useStore((s) => s.isSubmitting)` so `$derived` correctly tracks submission state
- Fix `isPending` from `useOnSuccessTransition` losing reactivity when destructured — keep object reference and access `transition.isPending` inside `$derived`
- Add missing spinners to `provider-button`, `passkey-button`, `verify-email`, and `magic-link-sent` components
