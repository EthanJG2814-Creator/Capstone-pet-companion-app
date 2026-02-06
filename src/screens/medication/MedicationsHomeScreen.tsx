import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { COLORS } from '../../utils/constants';
import type { MedicationStackParamList } from '../../types';
import type { StackScreenProps } from '@react-navigation/stack';

type ScreenProps = StackScreenProps<MedicationStackParamList, 'MedicationsHome'>;

export const MedicationsHomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { isDark } = useTheme();
  const { medications, loading, refreshMedications } = useMedications();

  useFocusEffect(
    useCallback(() => {
      refreshMedications();
    }, [refreshMedications])
  );

  const openDetails = (medication: import('../../types').Medication) => {
    navigation.navigate('MedicationDetails', { medication });
  };

  const openScanLabel = () => {
    navigation.navigate('MedicationLabelCapture');
  };

  const openAddManually = () => {
    navigation.navigate('MedicationReview', {
      editMode: false,
      existingMedication: undefined,
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading medications..." />;
  }

  const containerStyle = [styles.container, isDark && styles.containerDark];
  const titleStyle = [styles.title, isDark && styles.titleDark];
  const emptyStyle = [styles.emptyText, isDark && styles.emptyTextDark];
  const cardStyle = [styles.card, isDark && styles.cardDark];
  const medNameStyle = [styles.medName, isDark && styles.medNameDark];

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={titleStyle}>Medications</Text>
        <View style={styles.addActions}>
          <Button title="Scan label (OCR)" onPress={openScanLabel} variant="secondary" style={styles.addBtn} />
          <Button title="Add medication manually" onPress={openAddManually} variant="primary" style={styles.addBtn} />
        </View>
      </View>
      {medications.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="medication" size={56} color={COLORS.textSecondary} />
          <Text style={emptyStyle}>No medications yet</Text>
          <Text style={[styles.emptySub, isDark && styles.emptySubDark]}>
            Scan a prescription label or add details manually
          </Text>
          <View style={styles.emptyActions}>
            <Button title="Scan label (OCR)" onPress={openScanLabel} variant="secondary" style={styles.emptyBtn} />
            <Button title="Add medication manually" onPress={openAddManually} variant="primary" style={styles.emptyBtn} />
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {medications.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={cardStyle}
              onPress={() => openDetails(m)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="medication" size={24} color={COLORS.primary} />
              <View style={styles.cardText}>
                <Text style={medNameStyle}>{m.drugName}</Text>
                {m.dosage ? <Text style={[styles.dosage, isDark && styles.dosageDark]}>{m.dosage}</Text> : null}
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  titleDark: { color: COLORS.textDark },
  addActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  addBtn: { flex: 1, minWidth: 140 },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyTextDark: { color: COLORS.textDark },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  emptySubDark: { color: COLORS.textSecondaryDark },
  emptyActions: { marginTop: 20, width: '100%', maxWidth: 280, gap: 10 },
  emptyBtn: {},
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 14,
  },
  cardDark: { backgroundColor: COLORS.cardLightDark },
  cardText: { flex: 1, marginLeft: 12 },
  medName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  medNameDark: { color: COLORS.textDark },
  dosage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  dosageDark: { color: COLORS.textSecondaryDark },
});
