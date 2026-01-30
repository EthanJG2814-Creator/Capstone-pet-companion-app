import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/constants';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && (
        <Text style={[styles.message, isDark && styles.messageDark]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  messageDark: {
    color: COLORS.textSecondaryDark,
  },
});
