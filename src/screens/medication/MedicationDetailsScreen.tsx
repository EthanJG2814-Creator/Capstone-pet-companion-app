import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { Button } from '../../components/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/constants';
import type { Medication, MedicationStackParamList } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationDetails'>;

export const MedicationDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { isDark } = useTheme();
  const { medication } = route.params;
  const { updateMedication, deleteMedication } = useMedications();

  const name = medication.drugName ?? 'Medication';
  const strength = medication.strength ?? '';
  const dosage = medication.dosage ?? '';
  const frequency = medication.frequency ?? '';
  const instructions = medication.instructions ?? '';
  const quantity = medication.quantity ?? '';
  const refills = medication.refills ?? '';
  const reminderTimes = Array.isArray(medication.reminderTimes) ? medication.reminderTimes : [];
  const nextDose = SchedulingService.getNextDoseTime(medication);
  const rfidTagId = medication.rfidTagId ?? '';

  const handleDelete = () => {
    Alert.alert(
      'Delete medication',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMedication(medication.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('MedicationReview', {
      imageUri: '',
      rawOcrText: '',
      parsedData: undefined,
      editMode: true,
      existingMedication: medication,
    });
  };

  const handleSchedule = () => {
    navigation.navigate('MedicationSchedule', {
      medication: { ...medication, drugName: name, dosage, frequency, strength, instructions },
      editMode: true,
    });
  };

  const handleConfirm = () => {
    navigation.navigate('MedicationConfirmation', {
      medicationId: medication.id,
      scheduledTime: nextDose || new Date(),
    });
  };

  const handleLinkRFID = () => {
    navigation.navigate('LinkRFID', { medication });
  };

  const containerStyle = [styles.container, isDark && styles.containerDark];
  const cardStyle = [styles.card, isDark && styles.cardDark];
  const nameStyle = [styles.name, isDark && styles.nameDark];
  const strengthStyle = [styles.strength, isDark && styles.strengthDark];
  const cardTitleStyle = [styles.cardTitle, isDark && styles.cardTitleDark];
  const timeTextStyle = [styles.timeText, isDark && styles.timeTextDark];

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="medication" size={40} color={COLORS.primary} />
        </View>
        <Text style={nameStyle}>{name}</Text>
        {strength ? <Text style={strengthStyle}>{strength}</Text> : null}
      </View>

      <View style={cardStyle}>
        <Row icon="local-pharmacy" label="Dosage" value={dosage || 'Not set'} isDark={isDark} />
        <Row
          icon="schedule"
          label="Frequency"
          value={
            frequency === 'Once daily' && reminderTimes.length === 1
              ? `Once daily – ${SchedulingService.formatTime(reminderTimes[0] instanceof Date ? reminderTimes[0] : new Date(reminderTimes[0]))} reminder`
              : (frequency || 'Not set')
          }
          isDark={isDark}
        />
        {instructions ? <Row icon="info-outline" label="Instructions" value={instructions} isDark={isDark} /> : null}
        {quantity ? <Row icon="inventory" label="Quantity" value={quantity} isDark={isDark} /> : null}
        {refills ? <Row icon="autorenew" label="Refills" value={refills} isDark={isDark} /> : null}
        {nextDose && (
          <Row
            icon="access-time"
            label="Next dose"
            value={SchedulingService.formatTime(nextDose)}
            isDark={isDark}
          />
        )}
      </View>

      {reminderTimes.length > 0 && (
        <View style={cardStyle}>
          <Text style={cardTitleStyle}>Reminder times</Text>
          {reminderTimes.map((t, i) => (
            <Text key={i} style={timeTextStyle}>
              {SchedulingService.formatTime(t instanceof Date ? t : new Date(t))}
            </Text>
          ))}
        </View>
      )}

      {rfidTagId ? (
        <View style={[cardStyle, styles.rfidRow]}>
          <MaterialIcons name="nfc" size={22} color={COLORS.success} />
          <Text style={styles.rfidText}>RFID linked: {rfidTagId.slice(0, 12)}...</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button title="Edit medication" onPress={handleEdit} variant="primary" style={styles.btn} />
        <Button title="Set reminders" onPress={handleSchedule} variant="secondary" style={styles.btn} />
        <Button title="Log dose" onPress={handleConfirm} variant="primary" style={styles.btn} />
        <Button title="Link RFID tag" onPress={handleLinkRFID} variant="secondary" style={styles.btn} />
        <Button title="Delete medication" onPress={handleDelete} variant="danger" style={styles.btn} />
      </View>
    </ScrollView>
  );
};

function Row({
  icon,
  label,
  value,
  isDark,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  isDark?: boolean;
}) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={22} color={COLORS.primary} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>{label}</Text>
        <Text style={[styles.rowValue, isDark && styles.rowValueDark]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: 16, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 20 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  nameDark: { color: COLORS.textDark },
  strength: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  strengthDark: { color: COLORS.textSecondaryDark },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardDark: { backgroundColor: COLORS.cardLightDark },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  cardTitleDark: { color: COLORS.textDark },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rowText: { marginLeft: 12, flex: 1 },
  rowLabel: { fontSize: 12, color: COLORS.textSecondary },
  rowLabelDark: { color: COLORS.textSecondaryDark },
  rowValue: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  rowValueDark: { color: COLORS.textDark },
  timeText: { fontSize: 14, color: COLORS.text, marginBottom: 4 },
  timeTextDark: { color: COLORS.textDark },
  rfidRow: { flexDirection: 'row', alignItems: 'center' },
  rfidText: { fontSize: 13, color: COLORS.success, marginLeft: 8 },
  actions: { marginTop: 16 },
  btn: { marginBottom: 10 },
});
