-- ALTERNATIVE FIX: If you prefer manual signup (app creates profile)
-- Use this instead of migration 004 if you want the app to handle profile creation
-- This ensures the foreign key constraint works properly

-- Step 1: Disable RLS temporarily
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read all usernames" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable select own profile" ON public.users;
DROP POLICY IF EXISTS "Enable select all usernames" ON public.users;
DROP POLICY IF EXISTS "Enable update own profile" ON public.users;

-- Step 3: Verify the foreign key constraint exists and is correct
-- If the table doesn't have the proper constraint, we need to recreate it
DO $$
BEGIN
  -- Check if foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'users_id_fkey' 
    AND conrelid = 'public.users'::regclass
  ) THEN
    -- Drop and recreate table with proper foreign key
    DROP TABLE IF EXISTS public.users CASCADE;
    
    CREATE TABLE public.users (
      id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    -- Recreate indexes
    CREATE INDEX idx_users_username ON public.users(username);
    CREATE INDEX idx_users_email ON public.users(email);
    
    -- Recreate trigger for updated_at
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies that allow signup
-- The key is using TO authenticated and ensuring auth.uid() matches id

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow signup profile creation"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow anyone to read all usernames (for leaderboard)
CREATE POLICY "Anyone can read usernames"
ON public.users
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
