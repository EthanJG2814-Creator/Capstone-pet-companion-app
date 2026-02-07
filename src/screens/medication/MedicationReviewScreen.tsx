import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FREQUENCY_OPTIONS } from '../../utils/constants';
import { useTheme } from '../../contexts/ThemeContext';
import type { MedicationStackParamList, Medication, ParsedMedicationData } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationReview'>;

/** Normalize frequency to a value in FREQUENCY_OPTIONS, or default to Once daily */
function normalizeFrequency(value: string | undefined): string {
  if (!value || !value.trim()) return 'Once daily';
  const lower = value.trim().toLowerCase();
  const match = FREQUENCY_OPTIONS.find((opt) => opt.toLowerCase() === lower);
  if (match) return match;
  if (lower.includes('once') && lower.includes('daily')) return 'Once daily';
  if (lower.includes('twice') && lower.includes('daily')) return 'Twice daily';
  if (lower.includes('three') && lower.includes('daily')) return 'Three times daily';
  if (lower.includes('four') && lower.includes('daily')) return 'Four times daily';
  if (lower.includes('every other')) return 'Every other day';
  if (lower.includes('once') && lower.includes('weekly')) return 'Once weekly';
  if (lower.includes('twice') && lower.includes('weekly')) return 'Twice weekly';
  if (lower.includes('prn') || lower.includes('as needed')) return 'As needed (PRN)';
  return 'Once daily';
}

function getInitialValues(params: Props['route']['params']) {
  const editMode = params?.editMode ?? false;
  const existing = params?.existingMedication;
  const parsed = params?.parsedData;
  const raw = existing?.frequency ?? parsed?.frequency ?? 'Once daily';
  return {
    editMode,
    drugName: existing?.drugName ?? parsed?.drugName ?? '',
    dosage: existing?.dosage ?? parsed?.dosage ?? '',
    frequency: normalizeFrequency(typeof raw === 'string' ? raw : 'Once daily'),
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
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
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
        frequency: frequency.trim() || FREQUENCY_OPTIONS[0],
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
      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDark && styles.labelDark]}>Frequency</Text>
        <TouchableOpacity
          style={[styles.frequencyTouchable, isDark && styles.frequencyTouchableDark]}
          onPress={() => setFrequencyModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.frequencyValue, isDark && styles.frequencyValueDark]}>{frequency}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <Modal
        visible={frequencyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFrequencyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFrequencyModalVisible(false)}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Select frequency</Text>
            <FlatList
              data={FREQUENCY_OPTIONS.slice()}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, isDark && styles.optionRowDark]}
                  onPress={() => {
                    setFrequency(item);
                    setFrequencyModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isDark && styles.optionTextDark]}>{item}</Text>
                  {frequency === item ? (
                    <MaterialIcons name="check" size={24} color={COLORS.primary} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
            <Button title="Cancel" onPress={() => setFrequencyModalVisible(false)} variant="secondary" style={styles.modalCancel} />
          </View>
        </TouchableOpacity>
      </Modal>
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
  inputContainer: { marginVertical: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: COLORS.text },
  labelDark: { color: COLORS.textDark },
  frequencyTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  frequencyTouchableDark: {
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.backgroundDark,
  },
  frequencyValue: { fontSize: 16, color: COLORS.text },
  frequencyValueDark: { color: COLORS.textDark },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
  },
  modalContentDark: { backgroundColor: COLORS.backgroundDark },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  modalTitleDark: { color: COLORS.textDark },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionRowDark: { borderBottomColor: COLORS.borderDark },
  optionText: { fontSize: 16, color: COLORS.text },
  optionTextDark: { color: COLORS.textDark },
  modalCancel: { marginTop: 12 },
  btn: { marginTop: 12 },
});
