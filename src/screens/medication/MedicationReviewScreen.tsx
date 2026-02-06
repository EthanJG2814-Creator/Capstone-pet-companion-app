import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useMedications } from '../../contexts/MedicationsContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { useTheme } from '../../contexts/ThemeContext';
import type { MedicationStackParamList, Medication, ParsedMedicationData } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationReview'>;

function getInitialValues(params: Props['route']['params']) {
  const editMode = params?.editMode ?? false;
  const existing = params?.existingMedication;
  const parsed = params?.parsedData;
  return {
    editMode,
    drugName: existing?.drugName ?? parsed?.drugName ?? '',
    dosage: existing?.dosage ?? parsed?.dosage ?? '',
    frequency: existing?.frequency ?? parsed?.frequency ?? 'Once daily',
    imageUri: params?.imageUri ?? '',
  };
}

export const MedicationReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { isDark } = useTheme();
  const initial = useMemo(() => getInitialValues(route.params), [route.params]);
  const { addMedication, updateMedication } = useMedications();
  const [drugName, setDrugName] = useState(initial.drugName);
  const [dosage, setDosage] = useState(initial.dosage);
  const [frequency, setFrequency] = useState(initial.frequency);
  const [saving, setSaving] = useState(false);
  const imageUri = initial.imageUri;
  const editMode = initial.editMode;
  const existingMedication = route.params?.existingMedication;

  const handleSave = async () => {
    if (!drugName.trim()) return;
    setSaving(true);
    try {
      const base: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = {
        drugName: drugName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim() || 'Once daily',
        reminderTimes: existingMedication?.reminderTimes ?? [],
        startDate: existingMedication?.startDate ?? new Date(),
        user_key: existingMedication?.user_key,
      };
      if (editMode && existingMedication?.id) {
        await updateMedication({ ...existingMedication, ...base, id: existingMedication.id });
        navigation.navigate('MedicationDetails', { medication: { ...existingMedication, ...base } as Medication });
      } else {
        const created = await addMedication(base);
        navigation.navigate('MedicationDetails', { medication: created });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const containerStyle = [styles.container, isDark && styles.containerDark];
  const titleStyle = [styles.title, isDark && styles.titleDark];

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.content}>
      <Text style={titleStyle}>{editMode ? 'Edit medication' : 'Add medication'}</Text>
      {imageUri ? (
        <View style={styles.imageSection}>
          <Text style={[styles.imageLabel, isDark && styles.imageLabelDark]}>Captured label</Text>
          <Image source={{ uri: imageUri }} style={styles.capturedImage} resizeMode="contain" />
        </View>
      ) : null}
      <Input label="Medication name" value={drugName} onChangeText={setDrugName} placeholder="e.g. Aspirin" />
      <Input label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 81 mg" />
      <Input label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. Once daily" />
      <Button
        title={editMode ? 'Save changes' : 'Add medication'}
        onPress={handleSave}
        loading={saving}
        disabled={!drugName.trim()}
        style={styles.btn}
      />
      <Button title="Cancel" onPress={() => navigation.goBack()} variant="secondary" style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  titleDark: { color: COLORS.textDark },
  imageSection: { marginBottom: 16 },
  imageLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  imageLabelDark: { color: COLORS.textSecondaryDark },
  capturedImage: { width: '100%', height: 160, borderRadius: 12, backgroundColor: COLORS.border },
  btn: { marginTop: 12 },
});
