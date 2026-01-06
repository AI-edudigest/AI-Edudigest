# Role-Based UI Visibility Guide

This guide explains how to use the role-based UI visibility system to show/hide UI elements based on user roles.

## Overview

The role-based visibility system allows you to conditionally render UI components based on the current user's role. This ensures users only see features and options relevant to their role.

## Available Roles

- `admin` - Platform administrator
- `salesman` - Sales person
- `college_admin` / `college-admin` - College administrator
- `leader` / `leaders` - College leader
- `educator` / `educators` - College educator
- `user` - Default role

## Components

### 1. RoleGuard Component

The `RoleGuard` component conditionally renders children based on role configuration.

```tsx
import RoleGuard from '../components/common/RoleGuard';

// Show only to admins
<RoleGuard config={{ only: ['admin'] }}>
  <AdminButton />
</RoleGuard>

// Show to everyone except educators
<RoleGuard config={{ except: ['educator'] }}>
  <LeaderOnlyFeature />
</RoleGuard>

// Show to college users (admin, leader, educator)
<RoleGuard config={{ any: ['college_admin', 'leader', 'educator'] }}>
  <CollegeFeature />
</RoleGuard>

// Hide from specific roles
<RoleGuard config={{ not: ['user'] }}>
  <AuthenticatedFeature />
</RoleGuard>
```

### 2. useRoleVisibility Hook

The `useRoleVisibility` hook provides role information and visibility state.

```tsx
import { useRoleVisibility } from '../hooks/useRoleVisibility';

const MyComponent = () => {
  const { 
    isVisible, 
    userRole, 
    isLoading,
    isAdmin,
    isSalesman,
    isCollegeAdmin,
    isLeader,
    isEducator,
    isCollegeUser
  } = useRoleVisibility({ only: ['admin'] });

  if (isLoading) return <div>Loading...</div>;
  if (!isVisible) return null;

  return <div>Admin only content</div>;
};
```

## Configuration Options

### `only`
Show component only for specified roles.

```tsx
<RoleGuard config={{ only: ['admin', 'college_admin'] }}>
  <AdminFeature />
</RoleGuard>
```

### `except`
Show component to everyone except specified roles.

```tsx
<RoleGuard config={{ except: ['user'] }}>
  <AuthenticatedFeature />
</RoleGuard>
```

### `not`
Same as `except` - hide for specified roles.

```tsx
<RoleGuard config={{ not: ['educator'] }}>
  <NonEducatorFeature />
</RoleGuard>
```

### `any`
Show if user has any of the specified roles.

```tsx
<RoleGuard config={{ any: ['leader', 'educator'] }}>
  <CollegeUserFeature />
</RoleGuard>
```

### `all`
Show if user has all specified roles (for future multi-role support).

```tsx
<RoleGuard config={{ all: ['college_admin', 'leader'] }}>
  <MultiRoleFeature />
</RoleGuard>
```

## Examples

### Example 1: Admin Panel Button

```tsx
import RoleGuard from './common/RoleGuard';

<RoleGuard config={{ only: ['admin'] }}>
  <button onClick={handleAdminPanel}>
    Admin Panel
  </button>
</RoleGuard>
```

### Example 2: College Admin Dashboard

```tsx
<RoleGuard config={{ any: ['college_admin', 'college-admin'] }}>
  <CollegeDashboard />
</RoleGuard>
```

### Example 3: Leader and Educator Features

```tsx
<RoleGuard config={{ any: ['leader', 'educator'] }}>
  <CollegeUserContent />
</RoleGuard>
```

### Example 4: Hide from Salesmen

```tsx
<RoleGuard config={{ except: ['salesman'] }}>
  <RegularUserFeature />
</RoleGuard>
```

### Example 5: With Fallback

```tsx
<RoleGuard 
  config={{ only: ['admin'] }}
  fallback={<div>Access Denied</div>}
>
  <AdminContent />
</RoleGuard>
```

### Example 6: With Loading State

```tsx
<RoleGuard 
  config={{ only: ['admin'] }}
  showLoading={true}
  loadingComponent={<Spinner />}
>
  <AdminContent />
</RoleGuard>
```

## Best Practices

1. **Use RoleGuard for UI Elements**: Wrap buttons, menus, and sections with `RoleGuard` for clean conditional rendering.

2. **Combine with Route Guards**: Use role checks in route guards for security, not just UI.

3. **Provide Fallbacks**: Use the `fallback` prop to show appropriate messages when content is hidden.

4. **Normalize Roles**: The system automatically handles role variations (e.g., `college-admin` vs `college_admin`).

5. **Performance**: Role checks are cached and only re-run when user changes.

## Integration Points

### TopBar
- Admin Panel button (admin only)
- Profile dropdown (all authenticated users)
- Notifications (all authenticated users)

### Sidebar
- Navigation items (role-based filtering)
- Menu sections (role-based visibility)

### Admin Panel
- Dashboard sections (admin only)
- Management tabs (admin only)

### College Dashboard
- User management (college_admin only)
- College settings (college_admin only)

## Troubleshooting

### Component Not Showing
1. Check user role is correctly set in Firebase
2. Verify role name matches exactly (case-insensitive)
3. Check browser console for role loading errors
4. Ensure user is authenticated

### Component Showing When It Shouldn't
1. Verify role configuration is correct
2. Check for conflicting role checks
3. Ensure no legacy code bypassing RoleGuard

## Future Enhancements

- Multi-role support (users with multiple roles)
- Permission-based visibility (granular permissions)
- Role hierarchy (inherited permissions)
- Dynamic role assignment

