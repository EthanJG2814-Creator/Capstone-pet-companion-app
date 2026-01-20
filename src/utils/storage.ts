import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache user data locally for offline access
 */
export const cacheUserData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching user data:', error);
  }
};

/**
 * Retrieve cached user data
 */
export const getCachedUserData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving cached user data:', error);
    return null;
  }
};

/**
 * Clear cached data
 */
export const clearCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
