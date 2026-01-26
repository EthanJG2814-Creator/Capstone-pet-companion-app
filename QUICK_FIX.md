# Quick Fix for Foreign Key Constraint Error

## The Problem
Getting error: `Key (id)=(...) is not present in table "users"` when users sign up.

## The Solution (Choose One)

### Option A: Quick Fix (Recommended - 2 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of:
   ```
   supabase/migrations/FIX_FOREIGN_KEY_ISSUE.sql
   ```
3. Click **Run** (or press Ctrl+Enter)
4. Done! ✅

This fix:
- ✅ Creates a trigger to automatically create user profiles
- ✅ Fixes RLS policies to allow signup
- ✅ Ensures foreign key constraint works properly
- ✅ Works with existing data

### Option B: Step-by-Step Fix

If you prefer to understand each step, see `SUPABASE_FIX_INSTRUCTIONS.md` for detailed explanations.

## Test the Fix

1. **Sign up a new user** in your app
2. **Check Supabase Dashboard:**
   - Authentication → Users (should see new user)
   - Table Editor → users (should see profile created)
3. **If profile appears**, the fix worked! 🎉

## What Changed in the Code?

The `useAuth.ts` hook was updated to:
- Use `upsert` instead of `insert` (handles both trigger and manual creation)
- Add a small delay to ensure auth.users is committed
- Pass username in signup metadata

**No other code changes needed!**

## Still Having Issues?

See `SUPABASE_FIX_INSTRUCTIONS.md` for:
- Detailed troubleshooting steps
- Verification queries
- Alternative solutions
