import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useMedications } from '../../contexts/MedicationsContext';
import { SchedulingService } from '../../services/SchedulingService';
import { COLORS } from '../../utils/constants';
import type { Medication, MedicationStackParamList } from '../../types';

type Nav = StackNavigationProp<MedicationStackParamList, 'MedicationsHome'>;

const normalizeMed = (item: Medication) => ({
  id: item.id,
  name: item.drugName ?? 'Unknown',
  strength: item.strength ?? '',
  dosage: item.dosage ?? '',
  frequency: item.frequency ?? '',
  instructions: item.instructions ?? '',
  nextDose: SchedulingService.getNextDoseTime(item),
  raw: item,
});

export const MedicationsHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { medications, refreshMedications } = useMedications();
  const [refreshing, setRefreshing] = useState(false);

  const medList = useMemo(
    () => (Array.isArray(medications) ? medications : []).map(normalizeMed),
    [medications]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  }, [refreshMedications]);

  const handleAdd = () => {
    Alert.alert('Add medication', 'Choose how to add your medication.', [
      {
        text: 'Scan label',
        onPress: () => (navigation as any).navigate('MedicationLabelCapture'),
      },
      {
        text: 'Enter manually',
        onPress: () =>
          (navigation as any).navigate('MedicationReview', {
            imageUri: '',
            rawOcrText: '',
            parsedData: undefined,
            editMode: false,
            existingMedication: undefined,
          }),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const renderItem = ({ item }: { item: ReturnType<typeof normalizeMed> }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => (navigation as any).navigate('MedicationDetails', { medication: item.raw })}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="medication" size={28} color={COLORS.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.strength ? <Text style={styles.detail}>Strength: {item.strength}</Text> : null}
        {item.dosage ? <Text style={styles.detail}>Dosage: {item.dosage}</Text> : null}
        {item.frequency ? <Text style={styles.detail}>Frequency: {item.frequency}</Text> : null}
        {item.nextDose && (
          <View style={styles.nextRow}>
            <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
            <Text style={styles.nextText}>Next: {SchedulingService.formatTime(item.nextDose)}</Text>
          </View>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const empty = (
    <View style={styles.empty}>
      <MaterialIcons name="medication" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No medications</Text>
      <Text style={styles.emptySub}>Add one with the + button</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={empty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 88 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  detail: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  nextRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  nextText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
