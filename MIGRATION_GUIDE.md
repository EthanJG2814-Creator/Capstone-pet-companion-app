# Migration from Firebase to Supabase

This project has been migrated from Firebase to Supabase. This guide documents the changes made.

## Key Changes

### 1. Database
- **Before**: Firebase Firestore (NoSQL document database)
- **After**: Supabase PostgreSQL (SQL relational database)

### 2. Authentication
- **Before**: Firebase Authentication
- **After**: Supabase Authentication (built on PostgreSQL)

### 3. Real-time Updates
- **Before**: Firebase Firestore `onSnapshot` listeners
- **After**: Supabase Realtime subscriptions via PostgreSQL changes

### 4. Type Changes

#### User Type
```typescript
// Before (Firebase)
interface User {
  uid: string;
  username: string;
  email: string;
  createdAt: Timestamp;
}

// After (Supabase)
interface User {
  id: string; // UUID
  username: string;
  email: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

#### Tamagotchi Type
```typescript
// Before (Firebase)
interface Tamagotchi {
  id: string;
  ownerId: string;
  name: string;
  // ... stats
  createdAt: Timestamp;
  lastInteractionTime: Timestamp;
  totalInteractionsThisWeek: number;
}

// After (Supabase)
interface Tamagotchi {
  id: string; // UUID
  user_id: string; // UUID foreign key
  name: string;
  // ... stats
  created_at: string; // ISO timestamp
  last_interaction_time: string; // ISO timestamp
  total_interactions_this_week: number;
  is_alive: boolean;
}
```

### 5. Field Name Changes

All field names have been converted from camelCase to snake_case to match PostgreSQL conventions:

- `ownerId` → `user_id`
- `createdAt` → `created_at`
- `lastInteractionTime` → `last_interaction_time`
- `totalInteractionsThisWeek` → `total_interactions_this_week`

### 6. Error Handling

- **Before**: `getFirebaseErrorMessage()` function
- **After**: `getSupabaseErrorMessage()` function

The new function handles Supabase-specific error codes and PostgreSQL error codes.

### 7. Configuration

- **Before**: `src/config/firebase.ts`
- **After**: `src/config/supabase.ts`

Uses environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Migration Steps for Existing Data

If you have existing Firebase data, you'll need to:

1. Export data from Firebase
2. Transform field names (camelCase → snake_case)
3. Import into Supabase PostgreSQL tables
4. Map Firebase UIDs to Supabase UUIDs

## Benefits of Supabase

1. **SQL Database**: More powerful queries, joins, and aggregations
2. **Row Level Security**: Built-in PostgreSQL RLS policies
3. **Real-time**: PostgreSQL change streams for real-time updates
4. **Open Source**: Self-hostable if needed
5. **Better Type Safety**: Stronger typing with PostgreSQL schemas
