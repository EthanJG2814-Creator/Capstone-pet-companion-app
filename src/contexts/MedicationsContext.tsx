import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Medication, UserPreferences } from '../types';
import * as medicationStorage from '../services/medicationStorage';

type MedicationsContextValue = {
  medications: Medication[];
  preferences: UserPreferences | null;
  loading: boolean;
  refreshMedications: () => Promise<void>;
  addMedication: (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Medication>;
  updateMedication: (med: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  setPreferences: (prefs: UserPreferences) => Promise<void>;
  loadPreferences: () => Promise<void>;
};

const MedicationsContext = createContext<MedicationsContextValue | null>(null);

export function MedicationsProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [preferences, setPrefsState] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMedications = useCallback(async () => {
    if (!userId) {
      setMedications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const list = await medicationStorage.getMedications(userId);
    setMedications(list);
    setLoading(false);
  }, [userId]);

  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    const prefs = await medicationStorage.getPreferences(userId);
    setPrefsState(prefs);
  }, [userId]);

  useEffect(() => {
    refreshMedications();
    loadPreferences();
  }, [refreshMedications, loadPreferences]);

  const addMedication = useCallback(
    async (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!userId) throw new Error('Not logged in');
      const created = await medicationStorage.addMedication(userId, { ...med, user_key: userId } as any);
      await refreshMedications();
      return created;
    },
    [userId, refreshMedications]
  );

  const updateMedication = useCallback(
    async (med: Medication) => {
      if (!userId) throw new Error('Not logged in');
      await medicationStorage.updateMedication(userId, med);
      await refreshMedications();
    },
    [userId, refreshMedications]
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('Not logged in');
      await medicationStorage.deleteMedication(userId, id);
      await refreshMedications();
    },
    [userId, refreshMedications]
  );

  const setPreferences = useCallback(
    async (prefs: UserPreferences) => {
      if (!userId) throw new Error('Not logged in');
      await medicationStorage.savePreferences(userId, prefs);
      setPrefsState(prefs);
    },
    [userId]
  );

  const value: MedicationsContextValue = {
    medications,
    preferences,
    loading,
    refreshMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    setPreferences,
    loadPreferences,
  };

  return (
    <MedicationsContext.Provider value={value}>
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedications(): MedicationsContextValue {
  const ctx = useContext(MedicationsContext);
  if (!ctx) throw new Error('useMedications must be used within MedicationsProvider');
  return ctx;
}
