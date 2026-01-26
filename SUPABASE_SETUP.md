# Supabase Setup Checklist

Follow these steps to set up your Supabase backend for the Tamagotchi Leaderboard app.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Tamagotchi Leaderboard (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

## 2. Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create or update `.env` file in project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. **Important**: Restart Expo dev server after updating `.env`

## 4. Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Repeat for:
   - `002_rls_policies.sql`
   - `003_weekly_reset_function.sql`

## 5. Enable Real-time Replication

1. Go to **Database** → **Replication**
2. Find `tamagotchis` table
3. Toggle **Enable** for replication
4. This allows real-time updates for leaderboard

## 6. Verify Setup

### Test Authentication
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Try signing up in the app
3. You should see the new user appear in the dashboard

### Test Database
1. Go to **Table Editor** → `tamagotchis`
2. Create a tamagotchi in the app
3. You should see it appear in the table

### Test Real-time
1. Open app on two devices/simulators
2. Interact with pet on one device
3. Leaderboard should update on the other device automatically

## 7. Optional: Set Up Weekly Reset

### Option A: Using Supabase Edge Functions (Recommended)

1. Go to **Edge Functions** in dashboard
2. Create new function: `reset-weekly-interactions`
3. Use code:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     )
     
     const { error } = await supabase.rpc('reset_weekly_interactions')
     
     return new Response(
       JSON.stringify({ error }),
       { headers: { "Content-Type": "application/json" } }
     )
   })
   ```
4. Schedule via cron or external service (e.g., cron-job.org)

### Option B: Using pg_cron Extension

1. In SQL Editor, run:
   ```sql
   -- Enable pg_cron extension
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   
   -- Schedule weekly reset (every Monday at midnight UTC)
   SELECT cron.schedule(
     'reset-weekly-interactions',
     '0 0 * * 1',  -- Every Monday at 00:00 UTC
     $$SELECT reset_weekly_interactions()$$
   );
   ```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Verify variable names are exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Restart Expo dev server after changes

### "Row Level Security policy violation"
- Verify migrations `001` and `002` ran successfully
- Check RLS is enabled: `ALTER TABLE public.tamagotchis ENABLE ROW LEVEL SECURITY;`
- Verify policies exist in `pg_policies` table

### Real-time not working
- Check replication is enabled for `tamagotchis` table
- Verify you're using the correct Supabase client (with real-time enabled)
- Check browser/device network connection

### Authentication errors
- Verify email/password provider is enabled in Authentication → Providers
- Check user exists in Authentication → Users
- Verify RLS policies allow user to read their own data

## Security Notes

- **Never commit `.env` file** to version control
- The `anon` key is safe for client-side use (protected by RLS)
- For server-side operations, use `service_role` key (keep secret!)
- RLS policies ensure users can only modify their own data

## Next Steps

After setup is complete:
1. Test all app features
2. Create test users and tamagotchis
3. Verify real-time updates work
4. Set up weekly reset if needed
5. Consider adding database backups
