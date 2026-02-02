import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';
import type { MedicationStackParamList } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationConfirmation'>;

export const MedicationConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medicationId, scheduledTime } = route.params;
  const { medications } = useMedications();
  const [confirming, setConfirming] = useState(false);

  const medication = medications.find((m) => m.id === medicationId);
  const scheduled = scheduledTime instanceof Date ? scheduledTime : new Date(scheduledTime);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // In a full app you would log to adherence/backend here
      Alert.alert('Dose logged', 'Medication taken recorded.');
      navigation.goBack();
    } finally {
      setConfirming(false);
    }
  };

  if (!medication) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Medication not found</Text>
        <Button title="Go back" onPress={() => navigation.goBack()} style={styles.btn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <MaterialIcons name="medication" size={48} color={COLORS.primary} />
        <Text style={styles.name}>{medication.drugName}</Text>
        <Text style={styles.time}>{SchedulingService.formatTime(scheduled)}</Text>
      </View>
      <Button
        title="I took this dose"
        onPress={handleConfirm}
        loading={confirming}
        style={styles.btn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  time: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  text: { fontSize: 16, color: COLORS.text, marginBottom: 16 },
  btn: { marginTop: 16 },
});
