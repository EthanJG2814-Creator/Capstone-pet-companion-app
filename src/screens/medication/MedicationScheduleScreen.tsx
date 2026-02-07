import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { setHours, setMinutes, startOfDay } from 'date-fns';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService, parseFrequencyToTimesPerDay } from '../../services/SchedulingService';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import type { Medication, MedicationStackParamList } from '../../types';

const MAX_REMINDER_TIMES = 6;

type Props = StackScreenProps<MedicationStackParamList, 'MedicationSchedule'>;

/** Default time for "once daily" when no existing times: 9:00 AM */
function getDefaultFirstTime(): Date {
  return setHours(setMinutes(startOfDay(new Date()), 0), 9);
}

function toTimeOnly(date: Date): Date {
  return setHours(setMinutes(startOfDay(new Date()), date.getMinutes()), date.getHours());
}

export const MedicationScheduleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medication, editMode } = route.params;
  const { isDark } = useAppTheme();
  const { updateMedication, preferences } = useMedications();
  const [saving, setSaving] = useState(false);

  const prefs = preferences ?? SchedulingService.getDefaultPreferences();
  const timesPerDay = Math.min(
    Math.max(parseFrequencyToTimesPerDay(medication.frequency), 1),
    MAX_REMINDER_TIMES
  );

  const initialTimes = useMemo(() => {
    const existing = Array.isArray(medication.reminderTimes) ? medication.reminderTimes : [];
    if (existing.length > 0) {
      return existing.map((t) => (t instanceof Date ? t : new Date(t)));
    }
    const suggested = SchedulingService.generateReminderSchedule(medication, prefs, timesPerDay);
    if (suggested.length > 0) return suggested;
    return [getDefaultFirstTime()];
  }, []);

  const [selectedTimes, setSelectedTimes] = useState<Date[]>(initialTimes);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerValue, setPickerValue] = useState<Date>(selectedTimes[0] ?? getDefaultFirstTime());

  const canAddTime = selectedTimes.length < timesPerDay && selectedTimes.length < MAX_REMINDER_TIMES;
  const canRemoveTime = selectedTimes.length > 1;

  const handleTimeChange = (_event: unknown, date: Date | undefined) => {
    if (Platform.OS === 'android') setPickerIndex(null);
    if (date == null) return;
    const idx = pickerIndex;
    if (idx === null) return;
    const timeOnly = toTimeOnly(date);
    setSelectedTimes((prev) => {
      const next = [...prev];
      next[idx] = timeOnly;
      next.sort((a, b) => a.getHours() * 60 + a.getMinutes() - (b.getHours() * 60 + b.getMinutes()));
      return next;
    });
    if (Platform.OS === 'ios') setPickerValue(timeOnly);
  };

  const openPicker = (index: number) => {
    setPickerIndex(index);
    const current = selectedTimes[index];
    setPickerValue(current ? toTimeOnly(current) : getDefaultFirstTime());
  };

  const addTime = () => {
    if (!canAddTime) return;
    const last = selectedTimes[selectedTimes.length - 1];
    const nextHour = last ? (last.getHours() + 1) % 24 : 9;
    const newTime = setHours(setMinutes(startOfDay(new Date()), 0), nextHour);
    setSelectedTimes((prev) => [...prev, newTime].sort((a, b) => a.getHours() * 60 + a.getMinutes() - (b.getHours() * 60 + b.getMinutes())));
  };

  const removeTime = (index: number) => {
    if (!canRemoveTime) return;
    setSelectedTimes((prev) => prev.filter((_, i) => i !== index));
    if (pickerIndex === index) setPickerIndex(null);
    else if (pickerIndex != null && pickerIndex > index) setPickerIndex(pickerIndex - 1);
  };

  const handleSave = async () => {
    if (selectedTimes.length === 0) return;
    setSaving(true);
    try {
      const id = medication.id ?? `med_${Date.now()}`;
      const fullMed: Medication = {
        ...medication,
        id,
        reminderTimes: selectedTimes.map((t) => toTimeOnly(t)),
        startDate: medication.startDate ?? new Date(),
        user_key: medication.user_key,
      };
      if (medication.id) {
        await updateMedication(fullMed);
      }
      navigation.navigate('MedicationConfirmation', {
        medicationId: id,
        scheduledTime: selectedTimes[0] ?? new Date(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const containerStyle = [styles.container, isDark && styles.containerDark];
  const titleStyle = [styles.title, isDark && styles.titleDark];
  const subtitleStyle = [styles.subtitle, isDark && styles.subtitleDark];
  const cardStyle = [styles.card, isDark && styles.cardDark];
  const cardTitleStyle = [styles.cardTitle, isDark && styles.cardTitleDark];
  const timeRowStyle = [styles.timeRow, isDark && styles.timeRowDark];
  const hintStyle = [styles.hint, isDark && styles.hintDark];

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.content}>
      <Text style={titleStyle}>Set reminders</Text>
      <Text style={subtitleStyle}>
        {medication.drugName} · {medication.frequency || 'Once daily'}
      </Text>
      <Text style={hintStyle}>
        Choose when you want to be reminded. These times will appear on the Schedule tab and in medication details.
      </Text>
      <View style={cardStyle}>
        <Text style={cardTitleStyle}>Reminder times</Text>
        {selectedTimes.map((t, i) => (
          <View key={i} style={styles.timeRowWrap}>
            <TouchableOpacity
              style={[styles.timeTouchable, isDark && styles.timeTouchableDark]}
              onPress={() => openPicker(i)}
              activeOpacity={0.7}
            >
              <Text style={timeRowStyle}>
                {SchedulingService.formatTime(t instanceof Date ? t : new Date(t))}
              </Text>
              <MaterialIcons name="schedule" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            {canRemoveTime ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeTime(i)}
                hitSlop={8}
              >
                <MaterialIcons name="remove-circle-outline" size={24} color={COLORS.error} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        {canAddTime ? (
          <TouchableOpacity style={styles.addTimeBtn} onPress={addTime} activeOpacity={0.7}>
            <MaterialIcons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.addTimeText, isDark && styles.addTimeTextDark]}>Add another time</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {pickerIndex !== null && (
        <>
          {Platform.OS === 'android' ? (
            <DateTimePicker
              value={pickerValue}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          ) : (
            <View style={[styles.iosPickerWrap, isDark && styles.iosPickerWrapDark]}>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant={isDark ? 'dark' : 'light'}
                textColor={isDark ? COLORS.textDark : COLORS.text}
                style={styles.iosPicker}
              />
              <Button title="Done" onPress={() => setPickerIndex(null)} variant="primary" style={styles.doneBtn} />
            </View>
          )}
        </>
      )}

      <Button
        title="Save schedule"
        onPress={handleSave}
        loading={saving}
        disabled={selectedTimes.length === 0}
        style={styles.btn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  titleDark: { color: COLORS.textDark },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  subtitleDark: { color: COLORS.textSecondaryDark },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  hintDark: { color: COLORS.textSecondaryDark },
  card: { backgroundColor: COLORS.cardLight, borderRadius: 12, padding: 16, marginBottom: 20 },
  cardDark: { backgroundColor: COLORS.cardLightDark },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  cardTitleDark: { color: COLORS.textDark },
  timeRowWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  timeTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeTouchableDark: { backgroundColor: COLORS.backgroundDark, borderColor: COLORS.borderDark },
  timeRow: { fontSize: 16, color: COLORS.text },
  timeRowDark: { color: COLORS.textDark },
  removeBtn: { marginLeft: 8, padding: 4 },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  addTimeText: { fontSize: 15, color: COLORS.primary, marginLeft: 8 },
  addTimeTextDark: { color: COLORS.primaryLight },
  iosPickerWrap: { marginBottom: 16, backgroundColor: COLORS.background, borderRadius: 12 },
  iosPickerWrapDark: { backgroundColor: COLORS.backgroundDark, borderRadius: 12 },
  iosPicker: { height: 120 },
  doneBtn: { marginTop: 8 },
  btn: { marginTop: 8 },
});
