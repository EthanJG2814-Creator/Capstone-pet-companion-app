import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  username: string;
  email: string;
  createdAt: Timestamp;
}

export interface Tamagotchi {
  id: string;
  ownerId: string;
  name: string;
  health: number; // 0-100
  hunger: number; // 0-100
  happiness: number; // 0-100
  avatar: string; // emoji string
  createdAt: Timestamp;
  lastInteractionTime: Timestamp;
  totalInteractionsThisWeek: number;
}

export interface LeaderboardEntry {
  tamagotchi: Tamagotchi;
  ownerUsername: string;
  rank: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PetCreation: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

export type StatAction = 'feed' | 'play' | 'sleep';
