import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { COLORS } from '../../utils/constants';

export const ScheduleCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { medications, preferences, refreshMedications } = useMedications();

  useFocusEffect(
    useCallback(() => {
      refreshMedications();
    }, [refreshMedications])
  );

  const prefs = preferences ?? SchedulingService.getDefaultPreferences();
  const medsWithTimes = medications.filter((m) => Array.isArray(m.reminderTimes) && m.reminderTimes.length > 0);

  const getMedicationsForHour = (hour: number) => {
    return medsWithTimes.filter((m) =>
      (m.reminderTimes || []).some((t) => {
        const d = t instanceof Date ? t : new Date(t);
        return d.getHours() === hour;
      })
    );
  };

  const slots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's schedule</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScheduleSettings')} style={styles.settingsBtn}>
          <MaterialIcons name="settings" size={24} color={COLORS.primary} />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>
      {medsWithTimes.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="schedule" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No reminders set</Text>
          <Text style={styles.emptySub}>Add medications and set reminder times</Text>
        </View>
      ) : (
        <View style={styles.slots}>
          {slots.map((hour) => {
            const meds = getMedicationsForHour(hour);
            if (meds.length === 0) return null;
            return (
              <View key={hour} style={styles.slot}>
                <Text style={styles.time}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
                <View style={styles.medList}>
                  {meds.map((m) => (
                    <Text key={m.id} style={styles.medName}>{m.drugName}</Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  settingsBtn: { flexDirection: 'row', alignItems: 'center' },
  settingsText: { fontSize: 14, color: COLORS.primary, marginLeft: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  slots: { gap: 12 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 14,
  },
  time: { fontSize: 15, fontWeight: '600', color: COLORS.text, width: 56 },
  medList: { flex: 1 },
  medName: { fontSize: 14, color: COLORS.text },
});
