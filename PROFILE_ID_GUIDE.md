# User Profile ID Authentication Guide

This guide explains how the FitNest authentication system now automatically captures and provides user profile IDs when users log in.

## How It Works

When a user logs in, the AuthContext now automatically:
1. Determines the user's role (customer, trainer, or gym)
2. Fetches the corresponding profile ID from the database
3. Stores the profile ID in the context state for easy access

## Updated AuthContext Interface

```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  customerId: number | null  // Legacy field
  profileId: number | null   // NEW: Automatically populated profile ID
  loading: boolean
  signOut: () => Promise<void>
  refreshUserRole: () => Promise<void>
  getUserProfileId: () => Promise<number | null>  // Manual fetch function
}
```

## Using the Profile ID

### Automatic Access (Recommended)

The profile ID is automatically available after login:

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, userRole, profileId, loading } = useAuth()

  useEffect(() => {
    if (user && profileId) {
      console.log(`User ${user.email} has profile ID: ${profileId}`)
      
      // Use the profile ID to fetch user-specific data
      if (userRole === 'customer') {
        fetchCustomerData(profileId)
      } else if (userRole === 'trainer') {
        fetchTrainerData(profileId)
      } else if (userRole === 'gym') {
        fetchGymData(profileId)
      }
    }
  }, [user, profileId, userRole])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <p>Your profile ID: {profileId}</p>
      <p>Your role: {userRole}</p>
    </div>
  )
}
```

### Manual Fetch (When Needed)

You can also manually fetch the profile ID:

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { getUserProfileId } = useAuth()

  const handleGetProfileId = async () => {
    try {
      const id = await getUserProfileId()
      console.log('Profile ID:', id)
    } catch (error) {
      console.error('Error getting profile ID:', error)
    }
  }

  return (
    <button onClick={handleGetProfileId}>
      Get Profile ID
    </button>
  )
}
```

## Profile ID Mapping

The profile ID corresponds to different database tables based on user role:

| User Role | Database Table | ID Field | Profile ID Source |
|-----------|---------------|----------|-------------------|
| customer  | customer      | id       | customer.id       |
| trainer   | trainer       | id       | trainer.id        |
| gym       | gym           | gym_id   | gym.gym_id        |

## Key Features

1. **Automatic Population**: Profile ID is fetched automatically during login
2. **Role-Based**: Correct ID is fetched based on user role
3. **State Management**: Profile ID is stored in context state for easy access
4. **Manual Refresh**: Can manually refresh using `getUserProfileId()`
5. **Cleanup**: Profile ID is cleared on logout

## Example Usage Scenarios

### Customer Dashboard
```tsx
function CustomerDashboard() {
  const { profileId, userRole } = useAuth()

  useEffect(() => {
    if (profileId && userRole === 'customer') {
      // Fetch customer-specific data
      fetchCustomerProfile(profileId)
      fetchCustomerBookings(profileId)
      fetchCustomerPayments(profileId)
    }
  }, [profileId, userRole])

  // ... component code
}
```

### Trainer Profile
```tsx
function TrainerProfile() {
  const { profileId, userRole } = useAuth()

  useEffect(() => {
    if (profileId && userRole === 'trainer') {
      // Fetch trainer-specific data
      fetchTrainerDetails(profileId)
      fetchTrainerClients(profileId)
      fetchTrainerSchedule(profileId)
    }
  }, [profileId, userRole])

  // ... component code
}
```

### Gym Management
```tsx
function GymDashboard() {
  const { profileId, userRole } = useAuth()

  useEffect(() => {
    if (profileId && userRole === 'gym') {
      // Fetch gym-specific data
      fetchGymDetails(profileId)
      fetchGymMembers(profileId)
      fetchGymEquipment(profileId)
    }
  }, [profileId, userRole])

  // ... component code
}
```

## Error Handling

The system handles errors gracefully:

```tsx
function MyComponent() {
  const { profileId, userRole, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!profileId) {
    return <div>Profile ID not available. Please try logging in again.</div>
  }

  // Normal component rendering
  return <div>Profile ID: {profileId}</div>
}
```

## Migration from Old System

If you were previously fetching profile IDs manually, you can now use the automatic system:

### Before
```tsx
// Old way - manual fetching
const [profileId, setProfileId] = useState<number | null>(null)

useEffect(() => {
  const fetchProfileId = async () => {
    if (user && userRole === 'customer') {
      const { data } = await supabase
        .from('customer')
        .select('id')
        .eq('user_id', user.id)
        .single()
      setProfileId(data?.id || null)
    }
  }
  fetchProfileId()
}, [user, userRole])
```

### After
```tsx
// New way - automatic
const { profileId } = useAuth()
// profileId is automatically available!
```

## Benefits

1. **Simplified Code**: No need to manually fetch profile IDs
2. **Better Performance**: Profile ID is fetched once during login
3. **Consistent State**: Profile ID is always in sync with user state
4. **Error Reduction**: Less chance of bugs from manual ID fetching
5. **Better UX**: Faster loading since profile ID is immediately available

## Troubleshooting

1. **Profile ID is null**: Check if user has completed profile setup
2. **Wrong Profile ID**: Verify user role is correctly determined
3. **Profile ID not updating**: Call `refreshUserRole()` to refresh data

```tsx
const { refreshUserRole } = useAuth()

const handleRefresh = async () => {
  await refreshUserRole()
}
```
