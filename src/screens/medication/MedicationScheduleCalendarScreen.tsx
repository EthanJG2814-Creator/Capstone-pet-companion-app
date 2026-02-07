import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';
import type { Medication } from '../../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_SIZE = Math.floor((Dimensions.get('window').width - 32 - 24) / 7); // padding and gaps

function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

/**
 * Returns medications and their times for a given day.
 * A medication appears when:
 * 1. The date is a scheduled day for its frequency (occursOnDate), and
 * 2. It has at least one reminder time saved.
 * If it has no reminder time, it does not appear until the user sets at least one time on the Set reminders screen.
 * PRN is excluded from the schedule.
 */
function getMedicationsForDay(medications: Medication[], day: Date): Array<{ medication: Medication; time: Date }> {
  const result: Array<{ medication: Medication; time: Date }> = [];
  medications.forEach((m) => {
    if (!Array.isArray(m.reminderTimes) || m.reminderTimes.length === 0) return;
    if (!SchedulingService.occursOnDate(m, day)) return;
    const times = SchedulingService.getTimesForDay(m, day);
    times.forEach((time) => result.push({ medication: m, time }));
  });
  result.sort((a, b) => a.time.getTime() - b.time.getTime());
  return result;
}

export const MedicationScheduleCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { medications, refreshMedications } = useMedications();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      refreshMedications();
    }, [refreshMedications])
  );

  const medsWithTimes = useMemo(
    () => medications.filter((m) => Array.isArray(m.reminderTimes) && m.reminderTimes.length > 0),
    [medications]
  );

  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const dayMeds = useMemo(
    () => getMedicationsForDay(medsWithTimes, selectedDate),
    [medsWithTimes, selectedDate]
  );

  const goPrevMonth = () => setMonth((m) => subMonths(m, 1));
  const goNextMonth = () => setMonth((m) => addMonths(m, 1));

  const openScheduleSettings = () => navigation.navigate('ScheduleSettings');
  const openMedicationDetails = (medication: Medication) => {
    navigation.getParent()?.navigate('Medications', {
      screen: 'MedicationDetails',
      params: { medication },
    });
  };

  const containerStyle = [styles.container, isDark && styles.containerDark];
  const headerStyle = [styles.header, isDark && styles.headerDark];
  const titleStyle = [styles.title, isDark && styles.titleDark];
  const emptyStyle = [styles.emptyText, isDark && styles.emptyTextDark];
  const emptySubStyle = [styles.emptySub, isDark && styles.emptySubDark];
  const slotStyle = [styles.slot, isDark && styles.slotDark];
  const timeStyle = [styles.time, isDark && styles.timeDark];
  const medNameStyle = [styles.medName, isDark && styles.medNameDark];
  const dateCellStyle = (date: Date) => [
    styles.dateCell,
    isDark && styles.dateCellDark,
    !isSameMonth(date, month) && styles.dateCellOtherMonth,
    isSameDay(date, selectedDate) && (isDark ? styles.dateCellSelectedDark : styles.dateCellSelected),
  ];
  const dateNumStyle = (date: Date) => [
    styles.dateNum,
    isDark && styles.dateNumDark,
    !isSameMonth(date, month) && styles.dateNumOtherMonth,
    isSameDay(date, selectedDate) && styles.dateNumSelected,
  ];

  return (
    <SafeAreaView style={[styles.safeArea, containerStyle]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={headerStyle}>
        <Text style={titleStyle}>Medication schedule</Text>
        <TouchableOpacity onPress={openScheduleSettings} style={styles.settingsBtn} activeOpacity={0.7}>
          <MaterialIcons name="settings" size={24} color={COLORS.primary} />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Month navigation */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={goPrevMonth} style={styles.monthBtn} hitSlop={12}>
          <MaterialIcons name="chevron-left" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, isDark && styles.monthTitleDark]}>
          {format(month, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={goNextMonth} style={styles.monthBtn} hitSlop={12}>
          <MaterialIcons name="chevron-right" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[styles.weekday, isDark && styles.weekdayDark]} numberOfLines={1}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date) => (
          <TouchableOpacity
            key={date.toISOString()}
            style={dateCellStyle(date)}
            onPress={() => setSelectedDate(date)}
            activeOpacity={0.7}
          >
            <Text style={dateNumStyle(date)}>{format(date, 'd')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected day medications */}
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        {format(selectedDate, 'EEEE, MMM d')}
      </Text>
      {dayMeds.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="schedule" size={48} color={COLORS.textSecondary} />
          <Text style={emptyStyle}>No medications scheduled</Text>
          <Text style={emptySubStyle}>Select another day or add reminders in Medications</Text>
        </View>
      ) : (
        <View style={styles.slots}>
          {dayMeds.map(({ medication, time }) => (
            <TouchableOpacity
              key={`${medication.id}-${time.getTime()}`}
              style={slotStyle}
              onPress={() => openMedicationDetails(medication)}
              activeOpacity={0.7}
            >
              <Text style={timeStyle}>
                {SchedulingService.formatTime(time)}
              </Text>
              <View style={styles.medList}>
                <Text style={medNameStyle}>{medication.drugName}</Text>
                {medication.dosage ? (
                  <Text style={[styles.dosage, isDark && styles.dosageDark]}>{medication.dosage}</Text>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerDark: {},
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  titleDark: {
    color: COLORS.textDark,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthBtn: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  monthTitleDark: {
    color: COLORS.textDark,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    width: CELL_SIZE,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  weekdayDark: {
    color: COLORS.textSecondaryDark,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 24,
  },
  dateCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.cardLight,
  },
  dateCellDark: {
    backgroundColor: COLORS.cardLightDark,
  },
  dateCellOtherMonth: {
    opacity: 0.4,
  },
  dateCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dateCellSelectedDark: {
    backgroundColor: COLORS.primary,
  },
  dateNum: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateNumDark: {
    color: COLORS.textDark,
  },
  dateNumOtherMonth: {
    color: COLORS.textSecondary,
  },
  dateNumSelected: {
    color: COLORS.primaryContrast,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: COLORS.textDark,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyTextDark: {
    color: COLORS.textDark,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  emptySubDark: {
    color: COLORS.textSecondaryDark,
  },
  slots: {
    gap: 10,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 14,
  },
  slotDark: {
    backgroundColor: COLORS.cardLightDark,
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    width: 64,
  },
  timeDark: {
    color: COLORS.textDark,
  },
  medList: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  medNameDark: {
    color: COLORS.textDark,
  },
  dosage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dosageDark: {
    color: COLORS.textSecondaryDark,
  },
});
