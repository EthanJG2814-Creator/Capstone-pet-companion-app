-- Migration to fix users table foreign key and add automatic profile creation
-- This solves the foreign key constraint error during signup

-- Step 1: Disable RLS temporarily to allow modifications
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on users table
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

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Create function to handle new user creation
-- This function will be called automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table with the auth user's ID
  -- Note: We can't set username/email here because they're not available in the trigger
  -- The app will update these fields after signup
  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 7: Create CORRECT RLS policies

-- Allow users to insert their own profile (for manual signup flow)
CREATE POLICY "Enable insert for authenticated users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Enable select own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow anyone to read all usernames (for leaderboard)
CREATE POLICY "Enable select all usernames"
ON public.users
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Enable update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
