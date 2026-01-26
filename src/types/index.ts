// Database types matching Supabase schema
export interface User {
  id: string; // UUID from auth.users
  username: string;
  email: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
}

export interface Tamagotchi {
  id: string; // UUID
  user_id: string; // UUID foreign key to auth.users
  name: string;
  health: number; // 0-100
  hunger: number; // 0-100
  happiness: number; // 0-100
  avatar: string; // emoji string
  created_at: string; // ISO timestamp string
  last_interaction_time: string; // ISO timestamp string
  total_interactions_this_week: number;
  is_alive: boolean;
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
