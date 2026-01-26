-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
-- Note: Supabase Auth automatically creates auth.users table
-- This table stores additional user profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tamagotchis table
CREATE TABLE IF NOT EXISTS public.tamagotchis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  health INTEGER NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  hunger INTEGER NOT NULL DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  happiness INTEGER NOT NULL DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_interaction_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  total_interactions_this_week INTEGER NOT NULL DEFAULT 0 CHECK (total_interactions_this_week >= 0),
  is_alive BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tamagotchis_user_id ON public.tamagotchis(user_id);
CREATE INDEX IF NOT EXISTS idx_tamagotchis_interactions ON public.tamagotchis(total_interactions_this_week DESC);
CREATE INDEX IF NOT EXISTS idx_tamagotchis_alive ON public.tamagotchis(is_alive) WHERE is_alive = true;
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamagotchis ENABLE ROW LEVEL SECURITY;
