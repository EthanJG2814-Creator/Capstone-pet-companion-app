import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { Tamagotchi, StatAction } from '../types';
import { STAT_CHANGES } from '../utils/constants';
import { clampStat, getSupabaseErrorMessage } from '../utils/helpers';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useTamagotchi = (userId: string | null) => {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch tamagotchi from database
  const fetchTamagotchi = useCallback(async () => {
    if (!userId) {
      setTamagotchi(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tamagotchis')
        .select('*')
        .eq('user_id', userId)
        .eq('is_alive', true)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching tamagotchi:', fetchError);
        setError(getSupabaseErrorMessage(fetchError));
        setTamagotchi(null);
      } else if (data) {
        setTamagotchi(data as Tamagotchi);
      } else {
        setTamagotchi(null);
      }
    } catch (err: any) {
      console.error('Error in fetchTamagotchi:', err);
      setError(getSupabaseErrorMessage(err));
      setTamagotchi(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTamagotchi();

    // Set up real-time subscription for this user's tamagotchi
    if (!userId) {
      return;
    }

    const realtimeChannel = supabase
      .channel(`tamagotchi:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tamagotchis',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refetch tamagotchi when changes occur
          fetchTamagotchi();
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [userId, fetchTamagotchi]);

  const createTamagotchi = async (name: string, avatar: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    try {
      setError(null);
      const { data, error: createError } = await supabase
        .from('tamagotchis')
        .insert({
          user_id: userId,
          name,
          avatar,
          health: 100,
          hunger: 50,
          happiness: 50,
          total_interactions_this_week: 0,
          is_alive: true,
        })
        .select()
        .single();

      if (createError) {
        const errorMessage = getSupabaseErrorMessage(createError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (data) {
        setTamagotchi(data as Tamagotchi);
      }
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const performAction = async (action: StatAction): Promise<void> => {
    if (!tamagotchi || !userId) throw new Error('No tamagotchi found');

    try {
      setError(null);
      const changes = STAT_CHANGES[action];

      const updatedStats = {
        health: clampStat(tamagotchi.health + changes.health),
        hunger: clampStat(tamagotchi.hunger + changes.hunger),
        happiness: clampStat(tamagotchi.happiness + changes.happiness),
        last_interaction_time: new Date().toISOString(),
        total_interactions_this_week: tamagotchi.total_interactions_this_week + 1,
      };

      // Optimistically update local state for better UX
      setTamagotchi({
        ...tamagotchi,
        ...updatedStats,
      });

      const { data, error: updateError } = await supabase
        .from('tamagotchis')
        .update(updatedStats)
        .eq('id', tamagotchi.id)
        .select()
        .single();

      if (updateError) {
        // Revert optimistic update on error
        setTamagotchi(tamagotchi);
        const errorMessage = getSupabaseErrorMessage(updateError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Update with server response to ensure consistency
      if (data) {
        setTamagotchi(data as Tamagotchi);
      }
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const renameTamagotchi = async (newName: string): Promise<void> => {
    if (!tamagotchi) throw new Error('No tamagotchi found');

    try {
      setError(null);

      // Optimistically update local state
      const previousName = tamagotchi.name;
      setTamagotchi({ ...tamagotchi, name: newName });

      const { data, error: updateError } = await supabase
        .from('tamagotchis')
        .update({ name: newName })
        .eq('id', tamagotchi.id)
        .select()
        .single();

      if (updateError) {
        // Revert optimistic update on error
        setTamagotchi({ ...tamagotchi, name: previousName });
        const errorMessage = getSupabaseErrorMessage(updateError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Update with server response
      if (data) {
        setTamagotchi(data as Tamagotchi);
      }
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    tamagotchi,
    loading,
    error,
    createTamagotchi,
    performAction,
    renameTamagotchi,
  };
};
