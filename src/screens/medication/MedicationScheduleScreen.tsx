import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService, parseFrequencyToTimesPerDay } from '../../services/SchedulingService';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import type { Medication, MedicationStackParamList } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationSchedule'>;

export const MedicationScheduleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medication, editMode } = route.params;
  const { updateMedication, preferences } = useMedications();
  const [saving, setSaving] = useState(false);

  const prefs = preferences ?? SchedulingService.getDefaultPreferences();
  const timesPerDay = parseFrequencyToTimesPerDay(medication.frequency);
  const reminderTimes = SchedulingService.generateReminderSchedule(medication, prefs, timesPerDay);

  const handleSave = async () => {
    setSaving(true);
    try {
      const id = medication.id ?? `med_${Date.now()}`;
      const fullMed: Medication = {
        ...medication,
        id,
        reminderTimes,
        startDate: medication.startDate ?? new Date(),
        user_key: medication.user_key,
      };
      if (medication.id) {
        await updateMedication(fullMed);
      }
      navigation.navigate('MedicationConfirmation', {
        medicationId: id,
        scheduledTime: reminderTimes[0] ?? new Date(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set reminders</Text>
      <Text style={styles.subtitle}>{medication.drugName} · {timesPerDay}x per day</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggested times</Text>
        {reminderTimes.map((t, i) => (
          <Text key={i} style={styles.timeRow}>
            {SchedulingService.formatTime(t instanceof Date ? t : new Date(t))}
          </Text>
        ))}
      </View>
      <Button title="Save schedule" onPress={handleSave} loading={saving} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  card: { backgroundColor: COLORS.cardLight, borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  timeRow: { fontSize: 15, color: COLORS.text, marginBottom: 8 },
  btn: { marginTop: 8 },
});
