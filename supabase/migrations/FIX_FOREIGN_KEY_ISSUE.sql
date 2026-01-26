-- COMPREHENSIVE FIX for Foreign Key Constraint Error During Signup
-- Run this migration in Supabase SQL Editor to fix the signup issue
-- This is a complete fix that handles both trigger-based and manual signup approaches

-- ============================================================================
-- STEP 1: Clean up existing policies and triggers
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read all usernames" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for signup" ON public.users;
DROP POLICY IF EXISTS "Enable select own profile" ON public.users;
DROP POLICY IF EXISTS "Enable select all usernames" ON public.users;
DROP POLICY IF EXISTS "Enable update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow signup profile creation" ON public.users;
DROP POLICY IF EXISTS "Anyone can read usernames" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================================
-- STEP 2: Ensure users table has correct structure
-- ============================================================================

-- Check if table exists and has correct foreign key
DO $$
BEGIN
  -- If table doesn't exist, create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    CREATE TABLE public.users (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    -- Create indexes
    CREATE INDEX idx_users_username ON public.users(username);
    CREATE INDEX idx_users_email ON public.users(email);
    
    -- Create trigger for updated_at
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  ELSE
    -- Table exists, verify foreign key constraint
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_constraint 
      WHERE conname LIKE '%users%id%fkey%' 
        AND conrelid = 'public.users'::regclass
        AND contype = 'f'
    ) THEN
      -- Add foreign key if missing
      ALTER TABLE public.users
      ADD CONSTRAINT users_id_fkey 
      FOREIGN KEY (id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Create trigger function for automatic profile creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table with the auth user's ID
  -- Use username from metadata if available, otherwise generate one
  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Create trigger to automatically create user profile
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 5: Re-enable RLS and create proper policies
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert their own profile
-- This is a backup in case trigger doesn't fire or for manual creation
CREATE POLICY "Allow authenticated users to create profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Allow anyone to read all usernames (for leaderboard)
CREATE POLICY "Anyone can read usernames"
ON public.users
FOR SELECT
USING (true);

-- Policy 4: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION QUERIES (run these to verify the fix)
-- ============================================================================

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if foreign key exists
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name 
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.table_name = 'users' 
--   AND tc.constraint_type = 'FOREIGN KEY';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'users';
