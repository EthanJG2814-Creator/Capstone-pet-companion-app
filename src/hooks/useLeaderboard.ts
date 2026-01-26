import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { LeaderboardEntry, Tamagotchi, User } from '../types';
import { LEADERBOARD_LIMIT } from '../utils/constants';
import { getSupabaseErrorMessage } from '../utils/helpers';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);

      // Fetch top tamagotchis ordered by interactions this week
      const { data: tamagotchis, error: tamagotchiError } = await supabase
        .from('tamagotchis')
        .select('*')
        .eq('is_alive', true)
        .order('total_interactions_this_week', { ascending: false })
        .limit(LEADERBOARD_LIMIT);

      if (tamagotchiError) {
        console.error('Error fetching tamagotchis:', tamagotchiError);
        setError(getSupabaseErrorMessage(tamagotchiError));
        setEntries([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!tamagotchis || tamagotchis.length === 0) {
        setEntries([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch usernames for all owners
      const userIds = tamagotchis.map((t) => t.user_id);
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds);

      if (userError) {
        console.error('Error fetching users:', userError);
        // Continue with leaderboard even if usernames fail
      }

      // Create a map of user_id to username for quick lookup
      const usernameMap = new Map<string, string>();
      if (users) {
        users.forEach((user) => {
          usernameMap.set(user.id, user.username);
        });
      }

      // Build leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = tamagotchis.map(
        (tamagotchi, index) => ({
          tamagotchi: tamagotchi as Tamagotchi,
          ownerUsername: usernameMap.get(tamagotchi.user_id) || 'Unknown',
          rank: index + 1,
        })
      );

      setEntries(leaderboardEntries);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error in fetchLeaderboard:', err);
      setError(getSupabaseErrorMessage(err));
      setEntries([]);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Set up real-time subscription for leaderboard updates
    const realtimeChannel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tamagotchis',
          filter: 'is_alive=eq.true',
        },
        (payload) => {
          console.log('Leaderboard real-time update received:', payload);
          // Refetch leaderboard when any tamagotchi changes
          fetchLeaderboard();
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchLeaderboard]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  };

  return {
    entries,
    loading,
    error,
    refreshing,
    refresh,
  };
};
