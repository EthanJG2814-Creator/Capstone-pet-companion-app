import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Medication, UserPreferences } from '../types';

const MEDICATIONS_KEY = (userId: string) => `medications_${userId}`;
const PREFERENCES_KEY = (userId: string) => `user_preferences_${userId}`;

function serializeMedication(m: Medication): object {
  return {
    ...m,
    reminderTimes: (m.reminderTimes || []).map((t) => (t instanceof Date ? t.toISOString() : t)),
    startDate: m.startDate instanceof Date ? m.startDate.toISOString() : m.startDate,
    endDate: m.endDate instanceof Date ? m.endDate?.toISOString() : m.endDate,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt?.toISOString() : m.updatedAt,
  };
}

function deserializeMedication(raw: any): Medication {
  const r = raw.reminderTimes || [];
  return {
    ...raw,
    reminderTimes: r.map((t: string | Date) => (typeof t === 'string' ? new Date(t) : t)),
    startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
  };
}

export async function getMedications(userId: string): Promise<Medication[]> {
  try {
    const data = await AsyncStorage.getItem(MEDICATIONS_KEY(userId));
    if (!data) return [];
    const list = JSON.parse(data);
    return (Array.isArray(list) ? list : []).map(deserializeMedication);
  } catch {
    return [];
  }
}

export async function saveMedications(userId: string, list: Medication[]): Promise<void> {
  await AsyncStorage.setItem(
    MEDICATIONS_KEY(userId),
    JSON.stringify(list.map(serializeMedication))
  );
}

export async function addMedication(userId: string, med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
  const list = await getMedications(userId);
  const newMed: Medication = {
    ...med,
    id: `med_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  list.push(newMed);
  await saveMedications(userId, list);
  return newMed;
}

export async function updateMedication(userId: string, med: Medication): Promise<void> {
  const list = await getMedications(userId);
  const idx = list.findIndex((m) => m.id === med.id);
  if (idx >= 0) {
    list[idx] = { ...med, updatedAt: new Date() };
    await saveMedications(userId, list);
  }
}

export async function deleteMedication(userId: string, id: string): Promise<void> {
  const list = (await getMedications(userId)).filter((m) => m.id !== id);
  await saveMedications(userId, list);
}

export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_KEY(userId));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(PREFERENCES_KEY(userId), JSON.stringify(prefs));
}
