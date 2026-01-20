import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { COLORS } from '../utils/constants';

interface ProgressBarProps {
  value: number; // 0-100
  label: string;
  color: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
  showPercentage = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const clampedValue = Math.max(0, Math.min(100, value));
  const percentage = Math.round(clampedValue);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, isDark && styles.labelDark]}>
          {label}
        </Text>
        {showPercentage && (
          <Text style={[styles.percentage, isDark && styles.percentageDark]}>
            {percentage}%
          </Text>
        )}
      </View>
      <View
        style={[
          styles.track,
          isDark && styles.trackDark,
        ]}
      >
        <View
          style={[
            styles.fill,
            { width: `${clampedValue}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  labelDark: {
    color: COLORS.textDark,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  percentageDark: {
    color: COLORS.textSecondaryDark,
  },
  track: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  trackDark: {
    backgroundColor: COLORS.borderDark,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});
