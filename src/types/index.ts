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

// ============== Medication (from Cade integration) ==============
export interface Medication {
  id: string;
  user_key?: string;
  patientName?: string;
  drugName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  additionalInstructions?: string;
  rxNumber?: string;
  quantity?: string;
  refills?: string;
  pharmacy?: string;
  prescriber?: string;
  reminderTimes: Date[];
  startDate: Date;
  endDate?: Date;
  rawOcrText?: string;
  rfidTagId?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ParsedMedicationData {
  patientName?: string;
  drugName?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  rxNumber?: string;
  quantity?: string | number;
  refills?: string | number;
  pharmacy?: string;
  prescriber?: string;
  confidence: number;
}

export interface UserPreferences {
  wakeTime: string;
  sleepTime: string;
  mealTimes?: { breakfast?: string; lunch?: string; dinner?: string };
  notificationEnabled: boolean;
  notificationSound: boolean;
  useRFIDConfirmation?: boolean;
  confirmationWindowMinutes?: number;
}

export interface PatientStats {
  totalMedications: number;
  adherencePercentage: number;
  currentStreak: number;
  longestStreak: number;
  missedDoses: number;
  onTimeDoses: number;
}

// ============== Navigation ==============
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PetCreation: undefined;
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  ScheduleCalendar: undefined;
  ScheduleSettings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Medications: undefined;
  Settings: undefined;
};

export type MedicationStackParamList = {
  MedicationsHome: undefined;
  MedicationDetails: { medication: Medication };
  MedicationReview: { imageUri?: string; rawOcrText?: string; parsedData?: ParsedMedicationData; editMode?: boolean; existingMedication?: Medication };
  MedicationSchedule: { medication: Omit<Medication, 'reminderTimes'>; editMode?: boolean };
  MedicationConfirmation: { medicationId: string; scheduledTime: Date };
  LinkRFID: { medication: Medication };
};

export type StatAction = 'feed' | 'play' | 'sleep';
