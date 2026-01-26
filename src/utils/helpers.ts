import { MIN_STAT, MAX_STAT } from './constants';

/**
 * Clamps a stat value between MIN_STAT and MAX_STAT
 */
export const clampStat = (value: number): number => {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
};

/**
 * Formats a timestamp to a readable date string
 * Accepts ISO timestamp strings from Supabase
 */
export const formatDate = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'Never';
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a string is not empty or just whitespace
 */
export const isNotEmpty = (str: string): boolean => {
  return str.trim().length > 0;
};

/**
 * Gets Supabase error message in user-friendly format
 */
export const getSupabaseErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message || 'An unknown error occurred';
  
  // Map common Supabase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Incorrect email or password.',
    'Email already registered': 'This email is already registered.',
    'User already registered': 'This email is already registered.',
    'Password should be at least 6 characters': 'Password should be at least 6 characters.',
    'Invalid email': 'Invalid email address.',
    'Network request failed': 'Network error. Please check your internet connection.',
    'JWT expired': 'Your session has expired. Please sign in again.',
    'new row violates row-level security policy': 'You do not have permission to perform this action.',
    'duplicate key value violates unique constraint': 'This username is already taken.',
  };
  
  // Check if error message matches any known patterns
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // Check for PostgreSQL error codes
  if (error.code) {
    const pgErrorMap: Record<string, string> = {
      '23505': 'This value already exists. Please choose a different one.',
      '23503': 'Invalid reference. Please try again.',
      '42501': 'You do not have permission to perform this action.',
    };
    if (pgErrorMap[error.code]) {
      return pgErrorMap[error.code];
    }
  }
  
  return message;
};
