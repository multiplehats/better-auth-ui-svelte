---
"better-auth-ui-svelte": minor
---

Add `menuItems` snippet prop to `UserButton`

Renders custom `DropdownMenu` items (preceded by a separator) above the sign-out entry, enabling callers to inject any non-link content — e.g. a language switcher, theme toggle, or other action items — directly inside the user dropdown.

```svelte
<UserButton>
  {#snippet menuItems()}
    <DropdownMenu.Item onclick={toggleLanguage}>
      🌐 Language
    </DropdownMenu.Item>
  {/snippet}
</UserButton>
```
