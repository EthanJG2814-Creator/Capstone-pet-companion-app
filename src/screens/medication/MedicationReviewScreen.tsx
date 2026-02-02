import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useMedications } from '../../contexts/MedicationsContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { isNotEmpty } from '../../utils/helpers';
import type { Medication, ParsedMedicationData, MedicationStackParamList } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationReview'>;

export const MedicationReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { addMedication, updateMedication } = useMedications();
  const {
    parsedData,
    editMode = false,
    existingMedication,
  } = route.params || {};

  const [drugName, setDrugName] = useState(existingMedication?.drugName ?? parsedData?.drugName ?? '');
  const [dosage, setDosage] = useState(existingMedication?.dosage ?? parsedData?.dosage ?? '');
  const [frequency, setFrequency] = useState(existingMedication?.frequency ?? parsedData?.frequency ?? '');
  const [strength, setStrength] = useState(existingMedication?.strength ?? parsedData?.strength ?? '');
  const [instructions, setInstructions] = useState(existingMedication?.instructions ?? parsedData?.instructions ?? '');
  const [quantity, setQuantity] = useState(String(existingMedication?.quantity ?? parsedData?.quantity ?? ''));
  const [refills, setRefills] = useState(String(existingMedication?.refills ?? parsedData?.refills ?? ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isNotEmpty(drugName)) {
      Alert.alert('Error', 'Drug name is required');
      return;
    }
    setSaving(true);
    try {
      const reminderTimes = existingMedication?.reminderTimes ?? [];
      const startDate = existingMedication?.startDate ?? new Date();
      if (editMode && existingMedication) {
        await updateMedication({
          ...existingMedication,
          drugName: drugName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          strength: strength.trim(),
          instructions: instructions.trim() || undefined,
          quantity: quantity.trim() || undefined,
          refills: refills.trim() || undefined,
          reminderTimes,
          startDate,
        });
        Alert.alert('Saved', 'Medication updated');
      } else {
        await addMedication({
          drugName: drugName.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          strength: strength.trim(),
          instructions: instructions.trim() || undefined,
          quantity: quantity.trim() || undefined,
          refills: refills.trim() || undefined,
          reminderTimes: [],
          startDate,
        });
        Alert.alert('Saved', 'Medication added');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{editMode ? 'Edit medication' : 'Add medication'}</Text>

      <Input label="Drug name *" value={drugName} onChangeText={setDrugName} placeholder="e.g. Ibuprofen" autoCapitalize="words" />
      <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 200mg" />
      <Input label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. Twice daily" />
      <Input label="Strength" value={strength} onChangeText={setStrength} placeholder="e.g. 200mg" />
      <Input label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Take with food" />
      <Input label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="30" />
      <Input label="Refills" value={refills} onChangeText={setRefills} placeholder="3" />

      <Button title={editMode ? 'Save changes' : 'Add medication'} onPress={handleSave} loading={saving} disabled={!isNotEmpty(drugName)} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  btn: { marginTop: 16 },
});
