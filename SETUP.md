# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key from Settings → API

3. **Configure Environment Variables**
   - Create or update `.env` file in the root directory:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Set Up Database**
   - Open Supabase SQL Editor in your project dashboard
   - Run migrations in order from `supabase/migrations/`:
     1. `001_initial_schema.sql` - Creates tables and indexes
     2. `002_rls_policies.sql` - Sets up Row Level Security policies
     3. `003_weekly_reset_function.sql` - Creates weekly reset function
   - Enable real-time replication:
     - Go to Database → Replication
     - Enable replication for `tamagotchis` table

5. **Start Development Server**
   ```bash
   npm start
   ```

6. **Run on Device**
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## Testing the App

1. **Create Account**
   - Sign up with email/password
   - Enter a username

2. **Create Tamagotchi**
   - Choose a name and avatar
   - Click "Create Tamagotchi"

3. **Interact with Pet**
   - Use Feed, Play, and Sleep buttons
   - Watch stats change in real-time

4. **View Leaderboard**
   - See top 10 pets ranked by interactions
   - Pull down to refresh
   - Updates automatically when other users interact with their pets

5. **Update Settings**
   - Change username
   - Rename your pet
   - Sign out

## Troubleshooting

### Supabase Connection Issues
- Verify environment variables are set correctly in `.env`
- Check internet connection
- Ensure RLS policies are deployed
- Check Supabase project status in dashboard

### Real-time Updates Not Working
- Verify real-time replication is enabled for `tamagotchis` table
- Check Supabase dashboard → Database → Replication
- Restart the app to re-establish connections

### Navigation Issues
- Clear app cache: `expo start -c`
- Restart development server

### Type Errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version matches package.json
- Verify all Supabase types are correctly imported

### Database Errors
- Check RLS policies are correctly set up
- Verify user is authenticated before making requests
- Check Supabase logs in dashboard for detailed error messages

## Project Structure

- `src/components/` - Reusable UI components
- `src/screens/` - Screen components
- `src/hooks/` - Custom React hooks (useAuth, useTamagotchi, useLeaderboard)
- `src/navigation/` - Navigation setup
- `src/config/` - Configuration files (supabase.ts)
- `src/types/` - TypeScript definitions
- `src/utils/` - Utility functions
- `supabase/migrations/` - Database migration SQL files

## Database Schema

### Users Table
- `id` (UUID, primary key, references auth.users)
- `username` (text, unique)
- `email` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tamagotchis Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `name` (text)
- `health` (integer, 0-100)
- `hunger` (integer, 0-100)
- `happiness` (integer, 0-100)
- `avatar` (text, emoji)
- `created_at` (timestamp)
- `last_interaction_time` (timestamp)
- `total_interactions_this_week` (integer)
- `is_alive` (boolean)

## Security

Row Level Security (RLS) policies ensure:
- Users can only modify their own user profile
- Users can create/update/delete their own tamagotchi
- All users can read tamagotchis (for leaderboard)
- All users can read usernames (for leaderboard display)

## Next Steps

- Set up weekly reset cron job for interaction counts
- Add more avatar options
- Implement pet evolution system
- Add achievements/badges
- Implement push notifications for pet care reminders
