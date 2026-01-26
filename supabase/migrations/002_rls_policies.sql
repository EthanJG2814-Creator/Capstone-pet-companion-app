-- Row Level Security Policies for users table

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can read all usernames (for leaderboard display)
CREATE POLICY "Users can read all usernames"
  ON public.users
  FOR SELECT
  USING (true);

-- Row Level Security Policies for tamagotchis table

-- Users can read all tamagotchis (for leaderboard)
CREATE POLICY "Users can read all tamagotchis"
  ON public.tamagotchis
  FOR SELECT
  USING (true);

-- Users can create their own tamagotchi
CREATE POLICY "Users can create own tamagotchi"
  ON public.tamagotchis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tamagotchi
CREATE POLICY "Users can update own tamagotchi"
  ON public.tamagotchis
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tamagotchi
CREATE POLICY "Users can delete own tamagotchi"
  ON public.tamagotchis
  FOR DELETE
  USING (auth.uid() = user_id);
