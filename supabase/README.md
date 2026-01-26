# Supabase Database Setup

This directory contains SQL migration files for setting up the Tamagotchi Leaderboard database.

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Update Environment Variables**
   - Add your Supabase credentials to `.env`:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Run Migrations**
   - Open the Supabase SQL Editor in your project dashboard
   - Run the migrations in order:
     1. `001_initial_schema.sql` - Creates tables and indexes
     2. `002_rls_policies.sql` - Sets up Row Level Security policies
     3. `003_weekly_reset_function.sql` - Creates function for weekly resets

4. **Enable Real-time**
   - Go to Database > Replication in Supabase dashboard
   - Enable replication for the `tamagotchis` table
   - This allows real-time updates for the leaderboard

5. **Optional: Set up Weekly Reset Cron Job**
   - In Supabase dashboard, go to Database > Functions
   - Create a new Edge Function or use pg_cron extension
   - Schedule `reset_weekly_interactions()` to run weekly (e.g., every Monday at midnight)

## Database Schema

### Tables

- **users**: User profiles (extends auth.users)
- **tamagotchis**: Pet data with stats and interactions

### Security

All tables use Row Level Security (RLS) to ensure:
- Users can only modify their own data
- All users can read tamagotchis (for leaderboard)
- All users can read usernames (for leaderboard display)

## Testing

After setup, test the following:
1. Sign up a new user
2. Create a tamagotchi
3. Perform actions (feed, play, sleep)
4. Check leaderboard updates in real-time
