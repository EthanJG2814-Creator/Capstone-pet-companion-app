import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { LeaderboardEntry, Tamagotchi } from '../types';
import { LEADERBOARD_LIMIT } from '../utils/constants';
import { getFirebaseErrorMessage } from '../utils/helpers';

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Set up real-time listener for leaderboard
    const q = query(
      collection(db, 'tamagotchis'),
      orderBy('totalInteractionsThisWeek', 'desc'),
      limit(LEADERBOARD_LIMIT)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          setError(null);
          const leaderboardEntries: LeaderboardEntry[] = [];

          // Fetch owner usernames for each tamagotchi
          for (let i = 0; i < snapshot.docs.length; i++) {
            const docData = snapshot.docs[i].data() as Tamagotchi;
            const tamagotchi: Tamagotchi = {
              id: snapshot.docs[i].id,
              ...docData,
            };

            // Fetch owner username
            let ownerUsername = 'Unknown';
            try {
              const userDoc = await getDoc(doc(db, 'users', tamagotchi.ownerId));
              if (userDoc.exists()) {
                ownerUsername = userDoc.data().username || 'Unknown';
              }
            } catch (err) {
              console.error('Error fetching owner username:', err);
            }

            leaderboardEntries.push({
              tamagotchi,
              ownerUsername,
              rank: i + 1,
            });
          }

          setEntries(leaderboardEntries);
          setLoading(false);
          setRefreshing(false);
        } catch (err: any) {
          console.error('Error fetching leaderboard:', err);
          setError(getFirebaseErrorMessage(err));
          setLoading(false);
          setRefreshing(false);
        }
      },
      (err) => {
        console.error('Leaderboard snapshot error:', err);
        setError(getFirebaseErrorMessage(err));
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    // The onSnapshot will automatically update when data changes
    // This is just for pull-to-refresh UI feedback
    setTimeout(() => setRefreshing(false), 500);
  };

  return {
    entries,
    loading,
    error,
    refreshing,
    refresh,
  };
};
