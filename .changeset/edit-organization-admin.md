---
"better-auth-ui-svelte": minor
---

Add "Edit Organization" feature and custom actions support to admin organizations table.

**Edit Organization:**
Admins can now edit organizations directly from the admin dashboard, including:
- Organization name
- Organization slug
- Organization logo (with image upload support)

**Custom Actions:**
The organizations table now supports a `customActions` prop to add your own dropdown menu items:

```svelte
<OrganizationsAdminTable
  customActions={[
    {
      label: 'View Analytics',
      icon: BarChart,
      onClick: (org) => goto(`/analytics/${org.id}`)
    },
    {
      label: 'Archive',
      variant: 'destructive',
      onClick: (org) => archiveOrg(org.id),
      show: (org) => !org.metadata?.archived
    }
  ]}
/>
```

Each action supports: `label`, `icon` (Lucide icon), `onClick`, `variant` ('default' | 'destructive'), and `show` (conditional visibility).
