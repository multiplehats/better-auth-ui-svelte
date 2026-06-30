---
"better-auth-ui-svelte": minor
---

Add a slot to inject custom cards into the account settings area. `AccountView` gains a `settingsCards` snippet and `AccountSettingsCards` a `children` snippet, both rendered in the same column (matching gap + width) below the built-in account fields. The snippet receives the resolved card `classNames`, so custom cards built with the exported `SettingsCard` match the surrounding ones — e.g. a phone-number card.
