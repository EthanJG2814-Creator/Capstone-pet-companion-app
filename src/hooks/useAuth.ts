import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { getFirebaseErrorMessage } from '../utils/helpers';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
          }
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError(getFirebaseErrorMessage(err));
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, username: string): Promise<void> => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        username,
        email,
        createdAt: serverTimestamp() as any,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUserData(userData);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUserData(null);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUsername = async (newUsername: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      await setDoc(
        doc(db, 'users', user.uid),
        { username: newUsername },
        { merge: true }
      );
      setUserData((prev) => prev ? { ...prev, username: newUsername } : null);
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateUsername,
  };
};
