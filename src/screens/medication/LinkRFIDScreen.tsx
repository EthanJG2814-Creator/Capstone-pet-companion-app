import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS } from '../../utils/constants';
import type { MedicationStackParamList } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'LinkRFID'>;

export const LinkRFIDScreen: React.FC<Props> = ({ route, navigation }) => {
  const { medication } = route.params;
  const { updateMedication } = useMedications();
  const [tagId, setTagId] = useState(medication.rfidTagId ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMedication({ ...medication, rfidTagId: tagId.trim() || undefined });
      Alert.alert('Saved', tagId ? 'RFID tag linked.' : 'RFID tag cleared.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', (e as Error)?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Link RFID tag</Text>
      <Text style={styles.subtitle}>{medication.drugName}</Text>
      <Text style={styles.hint}>
        NFC/RFID hardware is optional. You can enter a tag ID manually or leave blank.
      </Text>
      <Input
        label="Tag ID"
        value={tagId}
        onChangeText={setTagId}
        placeholder="Optional tag identifier"
      />
      <Button title="Save" onPress={handleSave} loading={saving} style={styles.btn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  hint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },
  btn: { marginTop: 16 },
});
