import { MIN_STAT, MAX_STAT } from './constants';

/**
 * Clamps a stat value between MIN_STAT and MAX_STAT
 */
export const clampStat = (value: number): number => {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, value));
};

/**
 * Formats a timestamp to a readable date string
 */
export const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString();
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
 * Gets Firebase error message in user-friendly format
 */
export const getFirebaseErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const code = error.code || '';
  const message = error.message || 'An unknown error occurred';
  
  // Map common Firebase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'permission-denied': 'You do not have permission to perform this action.',
  };
  
  return errorMap[code] || message;
};
