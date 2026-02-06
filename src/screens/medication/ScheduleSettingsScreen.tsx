import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import type { UserPreferences } from '../../types';

export const ScheduleSettingsScreen: React.FC = () => {
  const { preferences, setPreferences, loadPreferences } = useMedications();
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    if (preferences) {
      setWakeTime(preferences.wakeTime);
      setSleepTime(preferences.sleepTime);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const prefs: UserPreferences = {
        ...(preferences ?? SchedulingService.getDefaultPreferences()),
        wakeTime,
        sleepTime,
        notificationEnabled: true,
        notificationSound: true,
      };
      await setPreferences(prefs);
      Alert.alert('Saved', 'Schedule settings updated.');
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Schedule settings</Text>
        <Text style={styles.hint}>Use 24-hour format (e.g. 07:00, 22:00)</Text>
        <Input label="Wake time" value={wakeTime} onChangeText={setWakeTime} placeholder="07:00" />
        <Input label="Sleep time" value={sleepTime} onChangeText={setSleepTime} placeholder="22:00" />
        <Button title="Save" onPress={handleSave} loading={saving} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },
  btn: { marginTop: 16 },
});
