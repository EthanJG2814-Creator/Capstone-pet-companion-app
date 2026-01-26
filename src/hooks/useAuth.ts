import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { User } from '../types';
import { getSupabaseErrorMessage } from '../utils/helpers';

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Fetch user profile data from users table
  const fetchUserData = async (userId: string): Promise<void> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // If user profile doesn't exist, it's okay - they might not have completed signup
        if (fetchError.code !== 'PGRST116') {
          console.error('Error fetching user data:', fetchError);
        }
        setUserData(null);
        return;
      }

      if (data) {
        setUserData(data as User);
      }
    } catch (err: any) {
      console.error('Error in fetchUserData:', err);
      setUserData(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const errorMessage = getSupabaseErrorMessage(signInError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (data.user) {
        await fetchUserData(data.user.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setError(null);

      // First, sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        const errorMessage = getSupabaseErrorMessage(signUpError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Then, create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email,
        });

      if (profileError) {
        // If profile creation fails, try to clean up auth user
        // (Note: In production, you might want to handle this differently)
        console.error('Error creating user profile:', profileError);
        const errorMessage = getSupabaseErrorMessage(profileError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Fetch the newly created user data
      await fetchUserData(authData.user.id);
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        const errorMessage = getSupabaseErrorMessage(signOutError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setUserData(null);
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUsername = async (newUsername: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (updateError) {
        const errorMessage = getSupabaseErrorMessage(updateError);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Update local state
      setUserData((prev) => (prev ? { ...prev, username: newUsername } : null));
    } catch (err: any) {
      const errorMessage = err.message || getSupabaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    userData,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUsername,
  };
};
