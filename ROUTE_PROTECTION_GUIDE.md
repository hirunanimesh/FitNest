# FitNest Route Protection Implementation

## Overview
This implementation provides role-based route protection for the FitNest application, ensuring users can only access routes appropriate for their role.

## Key Components

### 1. AuthContext (`contexts/AuthContext.tsx`)
- Manages authentication state globally
- Determines user role by checking database tables (`customer`, `trainer`, `gym`)
- Handles OAuth users with metadata roles
- Provides `useAuth` hook for components

### 2. ProtectedRoute (`components/ProtectedRoute.tsx`)
- Wraps protected pages/components
- Accepts `allowedRoles` array to specify which roles can access the route
- Redirects unauthorized users to their appropriate dashboard
- Shows loading state during authentication checks

### 3. PublicRoute (`components/PublicRoute.tsx`)
- Simple wrapper for public routes
- No authentication checks performed
- Allows any user to access the content

## Route Protection Implementation

### Public Routes (No Authentication Required)
These routes use `PublicRoute` and are accessible to anyone:

- **Home**: `/` (Homepage)
- **About**: `/about` (About page)
- **Contact**: `/contact` (Contact page)
- **Authentication**: 
  - `/auth/login` (Login page)
  - `/auth/signup` (Signup selection page)
  - `/auth/signup/user` (User signup)
  - `/auth/signup/trainer` (Trainer signup)
  - `/auth/signup/gym` (Gym signup)
  - `/auth/complete-profile/*` (Profile completion pages)
- **Public Profiles**:
  - `/profile/user/*` (Public user profiles)
  - `/profile/trainer/*` (Public trainer profiles)
  - `/profile/gym/*` (Public gym profiles)

### Protected Routes (Authentication Required)

#### Customer Dashboard (`allowedRoles: ['customer']`)
- `/dashboard/user` - Main user dashboard
- `/dashboard/user/profile` - User profile settings
- `/dashboard/user/search` - Search gyms/trainers
- Any other `/dashboard/user/*` routes

#### Trainer Dashboard (`allowedRoles: ['trainer']`)
- `/dashboard/trainer` - Main trainer dashboard
- `/dashboard/trainer/profile` - Trainer profile settings
- `/dashboard/trainer/plans` - Trainer workout plans
- Any other `/dashboard/trainer/*` routes

#### Gym Dashboard (`allowedRoles: ['gym']`)
- `/dashboard/gym` - Main gym dashboard
- `/dashboard/gym/profile/[id]` - Gym profile management
- `/dashboard/gym/plans` - Gym membership plans
- Any other `/dashboard/gym/*` routes

#### Admin Dashboard (`allowedRoles: ['admin']`)
- `/dashboard/admin` - Admin dashboard (if needed)

## User Role Detection Logic

The system determines user roles using the following priority:

1. **OAuth Users**: Check `user.user_metadata.role`
2. **Regular Users**: Query database tables in order:
   - `customer` table → role: `'customer'`
   - `trainer` table → role: `'trainer'`
   - `gym` table → role: `'gym'`
3. **No Profile Found**: Return `null` (triggers profile completion flow)

## Redirection Logic

### Unauthorized Access
When a user tries to access a protected route they're not authorized for:
- **Customer** → Redirected to `/dashboard/user`
- **Trainer** → Redirected to `/dashboard/trainer`
- **Gym** → Redirected to `/dashboard/gym`
- **Admin** → Redirected to `/dashboard/admin`

### Unauthenticated Access
- Users without authentication → Redirected to `/auth/login`

### Incomplete Profile
- Authenticated users without role → Redirected to `/auth/complete-profile`

## Usage Examples

### Protecting a Route
```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      {/* Dashboard content */}
    </ProtectedRoute>
  )
}
```

### Public Route
```tsx
import { PublicRoute } from "@/components/PublicRoute"

export default function HomePage() {
  return (
    <PublicRoute>
      {/* Public content */}
    </PublicRoute>
  )
}
```

### Using Auth Context
```tsx
import { useAuth } from "@/contexts/AuthContext"

function SomeComponent() {
  const { user, userRole, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  
  return <div>Welcome, {user.email}! Role: {userRole}</div>
}
```

## Security Features

1. **Server-Side Protection**: All route protection happens on the client-side with immediate redirects
2. **Role-Based Access**: Fine-grained control over which roles can access specific routes
3. **Loading States**: Proper loading indicators while authentication is being verified
4. **Automatic Redirects**: Users are seamlessly redirected to appropriate dashboards
5. **Profile Completion Flow**: Handles OAuth users who haven't completed their profiles

## Benefits

1. **User Experience**: Users don't see authentication checks on public routes
2. **Security**: Protected routes are only accessible to authorized users
3. **Flexibility**: Easy to add new roles or modify access patterns
4. **Performance**: No unnecessary auth checks on public pages
5. **Maintainability**: Clear separation between public and protected routes

This implementation ensures that your FitNest application has proper security while maintaining a smooth user experience across all user types.
