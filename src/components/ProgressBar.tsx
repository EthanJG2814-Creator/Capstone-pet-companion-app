import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/constants';

interface ProgressBarProps {
  value: number; // 0-100 (or custom max when alwaysFullColor is used)
  label: string;
  color: string;
  showPercentage?: boolean;
  trackColor?: string;
  labelColor?: string;
  /** When set, bar is always 100% width; color indicates level (e.g. happiness mood) */
  alwaysFullColor?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
  showPercentage = true,
  trackColor,
  labelColor,
  alwaysFullColor = false,
}) => {
  const { isDark } = useTheme();

  const clampedValue = Math.max(0, Math.min(100, value));
  const fillWidth = alwaysFullColor ? 100 : clampedValue;
  const percentage = Math.round(clampedValue);
  const textColorStyle = labelColor ? { color: labelColor } : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, !labelColor && isDark && styles.labelDark, textColorStyle]}>
          {label}
        </Text>
        {showPercentage && (
          <Text style={[styles.percentage, !labelColor && isDark && styles.percentageDark, textColorStyle]}>
            {percentage}%
          </Text>
        )}
      </View>
      <View
        style={[
          styles.track,
          isDark && !trackColor && styles.trackDark,
          trackColor && { backgroundColor: trackColor },
        ]}
      >
        <View
          style={[
            styles.fill,
            { width: `${fillWidth}%`, backgroundColor: color },
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
