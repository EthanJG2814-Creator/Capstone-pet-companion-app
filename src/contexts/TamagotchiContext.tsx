import React, { createContext, useContext, ReactNode } from 'react';
import { useTamagotchi } from '../hooks/useTamagotchi';

type TamagotchiContextValue = ReturnType<typeof useTamagotchi>;

const TamagotchiContext = createContext<TamagotchiContextValue | null>(null);

interface TamagotchiProviderProps {
  userId: string | null;
  children: ReactNode;
}

/**
 * Provides shared tamagotchi state so that when a user creates a tamagotchi
 * on PetCreationScreen, AppNavigator sees the update and switches to Home.
 */
export const TamagotchiProvider: React.FC<TamagotchiProviderProps> = ({
  userId,
  children,
}) => {
  const value = useTamagotchi(userId);
  return (
    <TamagotchiContext.Provider value={value}>
      {children}
    </TamagotchiContext.Provider>
  );
};

export const useTamagotchiContext = (): TamagotchiContextValue => {
  const context = useContext(TamagotchiContext);
  if (context == null) {
    throw new Error(
      'useTamagotchiContext must be used within a TamagotchiProvider'
    );
  }
  return context;
};
