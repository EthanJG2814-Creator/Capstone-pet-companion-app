import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tamagotchi, StatAction } from '../types';
import { STAT_CHANGES, clampStat } from '../utils/constants';
import { getFirebaseErrorMessage } from '../utils/helpers';

export const useTamagotchi = (ownerId: string | null) => {
  const [tamagotchi, setTamagotchi] = useState<Tamagotchi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setTamagotchi(null);
      setLoading(false);
      return;
    }

    const fetchTamagotchi = async () => {
      try {
        setError(null);
        const q = query(
          collection(db, 'tamagotchis'),
          where('ownerId', '==', ownerId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setTamagotchi({ id: doc.id, ...doc.data() } as Tamagotchi);
        } else {
          setTamagotchi(null);
        }
      } catch (err: any) {
        console.error('Error fetching tamagotchi:', err);
        setError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTamagotchi();
  }, [ownerId]);

  const createTamagotchi = async (
    name: string,
    avatar: string
  ): Promise<void> => {
    if (!ownerId) throw new Error('User not authenticated');

    try {
      setError(null);
      const newTamagotchi = {
        ownerId,
        name,
        avatar,
        health: 100,
        hunger: 50,
        happiness: 50,
        createdAt: serverTimestamp(),
        lastInteractionTime: serverTimestamp(),
        totalInteractionsThisWeek: 0,
      };

      const docRef = await addDoc(collection(db, 'tamagotchis'), newTamagotchi);
      setTamagotchi({ id: docRef.id, ...newTamagotchi } as Tamagotchi);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const performAction = async (action: StatAction): Promise<void> => {
    if (!tamagotchi || !ownerId) throw new Error('No tamagotchi found');

    try {
      setError(null);
      const changes = STAT_CHANGES[action];
      
      const updatedStats = {
        health: clampStat(tamagotchi.health + changes.health),
        hunger: clampStat(tamagotchi.hunger + changes.hunger),
        happiness: clampStat(tamagotchi.happiness + changes.happiness),
        lastInteractionTime: serverTimestamp(),
        totalInteractionsThisWeek: tamagotchi.totalInteractionsThisWeek + 1,
      };

      await updateDoc(doc(db, 'tamagotchis', tamagotchi.id), updatedStats);

      // Update local state immediately for responsive UI
      setTamagotchi({
        ...tamagotchi,
        ...updatedStats,
      } as Tamagotchi);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const renameTamagotchi = async (newName: string): Promise<void> => {
    if (!tamagotchi) throw new Error('No tamagotchi found');

    try {
      setError(null);
      await updateDoc(doc(db, 'tamagotchis', tamagotchi.id), {
        name: newName,
      });

      setTamagotchi({ ...tamagotchi, name: newName });
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    tamagotchi,
    loading,
    error,
    createTamagotchi,
    performAction,
    renameTamagotchi,
  };
};
