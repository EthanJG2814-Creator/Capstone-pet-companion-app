import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../utils/constants';

interface DashboardStatBarProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  label: string;
  value: string | number;
  barValue: number; // 0-100 for fill
  barColor: string;
}

export const DashboardStatBar: React.FC<DashboardStatBarProps> = ({
  icon,
  iconBgColor,
  label,
  value,
  barValue,
  barColor,
}) => {
  const { isDark } = useTheme();
  const clamped = Math.max(0, Math.min(100, barValue));

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <MaterialIcons name={icon} size={20} color={COLORS.primaryContrast} />
      </View>
      <View style={styles.barWrapper}>
        <Text style={[styles.labelValue, isDark && styles.labelValueDark]}>
          {label}: {value}
        </Text>
        <View style={[styles.track, isDark && styles.trackDark]}>
          <View
            style={[
              styles.fill,
              { width: `${clamped}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  barWrapper: { flex: 1 },
  labelValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  labelValueDark: {
    color: COLORS.textDark,
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  trackDark: {
    backgroundColor: COLORS.borderDark,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
