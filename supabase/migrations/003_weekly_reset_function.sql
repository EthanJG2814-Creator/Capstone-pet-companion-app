-- Function to reset weekly interaction counts
-- This can be called via a cron job or manually
CREATE OR REPLACE FUNCTION reset_weekly_interactions()
RETURNS void AS $$
BEGIN
  UPDATE public.tamagotchis
  SET total_interactions_this_week = 0
  WHERE total_interactions_this_week > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_weekly_interactions() TO authenticated;
