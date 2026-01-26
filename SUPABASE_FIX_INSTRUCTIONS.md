# Supabase Foreign Key Constraint Fix

## Problem
Foreign key constraint error (code 23503) when users sign up:
"Key (id)=(...) is not present in table "users"."

## Root Cause
The foreign key constraint between `public.users.id` and `auth.users.id` is failing during signup because:
1. Supabase Auth creates the user in `auth.users` 
2. The app tries to insert into `public.users` immediately
3. There may be a timing issue or RLS policy blocking the insert

## Solution Options

### Option 1: Automatic Profile Creation (RECOMMENDED)
Use a database trigger to automatically create the user profile when a user signs up. This ensures the profile is created in the same transaction.

**Steps:**
1. Open Supabase SQL Editor
2. Run migration `004_fix_users_table_and_trigger.sql`
3. This creates a trigger that automatically creates user profiles
4. Update your app code to use `upsert` instead of `insert` (already done in useAuth.ts)

**Benefits:**
- No timing issues
- Profile always created
- App can still update username/email after creation

### Option 2: Manual Signup with Fixed RLS Policies
Fix the RLS policies to allow authenticated users to insert their own profile.

**Steps:**
1. Open Supabase SQL Editor
2. Run migration `005_alternative_manual_signup_fix.sql`
3. This fixes RLS policies to allow signup
4. The app code will handle profile creation (already implemented)

**Benefits:**
- More control over profile creation
- Can set username/email immediately
- Requires proper RLS policy setup

## Which Option to Choose?

**Use Option 1 (Trigger)** if:
- You want automatic profile creation
- You want to ensure profiles are always created
- You don't mind updating username/email after signup

**Use Option 2 (Manual)** if:
- You want full control over profile creation
- You want to set username/email immediately during signup
- You're comfortable with RLS policies

## Implementation Steps

### For Option 1 (Trigger - Recommended):

1. **Run the migration:**
   ```sql
   -- Copy and paste contents of 004_fix_users_table_and_trigger.sql
   -- into Supabase SQL Editor and run it
   ```

2. **Verify the trigger:**
   ```sql
   -- Check if trigger exists
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   
   -- Check if function exists
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Test signup:**
   - Sign up a new user in the app
   - Check `public.users` table - profile should be created automatically
   - The app will then update username/email via upsert

### For Option 2 (Manual):

1. **Run the migration:**
   ```sql
   -- Copy and paste contents of 005_alternative_manual_signup_fix.sql
   -- into Supabase SQL Editor and run it
   ```

2. **Verify RLS policies:**
   ```sql
   -- Check policies exist
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. **Test signup:**
   - Sign up a new user in the app
   - Check `public.users` table - profile should be created by app code

## Troubleshooting

### Still getting foreign key errors?

1. **Check foreign key constraint exists:**
   ```sql
   SELECT 
     tc.constraint_name, 
     tc.table_name, 
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.table_name = 'users' 
     AND tc.constraint_type = 'FOREIGN KEY';
   ```

2. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'users';
   ```

3. **Check policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

4. **Test manual insert:**
   ```sql
   -- Get your user ID from auth.users
   SELECT id, email FROM auth.users LIMIT 1;
   
   -- Try inserting (replace with actual UUID)
   INSERT INTO public.users (id, username, email)
   VALUES ('your-user-id-here', 'testuser', 'test@example.com');
   ```

### RLS policy blocking insert?

The policy should be:
```sql
CREATE POLICY "Allow signup profile creation"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

Make sure:
- Policy uses `TO authenticated` (not `TO anon`)
- `WITH CHECK` uses `auth.uid() = id`
- RLS is enabled on the table

### Trigger not firing?

1. **Check trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Test trigger manually:**
   ```sql
   -- This should create a profile automatically
   -- (Don't actually run this, just verify the trigger would fire)
   ```

## App Code Changes

The `useAuth.ts` hook has been updated to:
- Use `upsert` instead of `insert` (works with both options)
- Add a small delay to ensure auth.users is committed
- Pass username in signup metadata

No other code changes needed!

## Verification

After applying the fix:

1. **Sign up a new user** in the app
2. **Check Supabase dashboard:**
   - Go to Authentication → Users (should see new user)
   - Go to Table Editor → users (should see profile)
3. **Verify data:**
   - Username should be set
   - Email should match auth user email
   - Created_at should be recent

If everything works, the fix is successful! 🎉
