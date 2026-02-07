// Stat limits
export const MIN_STAT = 0;
export const MAX_STAT = 100;

// Stat change values for actions
export const STAT_CHANGES = {
  feed: {
    hunger: -30,
    happiness: 10,
    health: 5,
  },
  play: {
    hunger: -20,
    happiness: 30,
    health: -5,
  },
  sleep: {
    hunger: -10,
    health: 50,
    happiness: 50,
  },
} as const;

// Avatar options
export const AVATAR_OPTIONS = ['🐢', '🦎', '🐉', '🦜'] as const;

// Leaderboard limit
export const LEADERBOARD_LIMIT = 10;

/** Medication frequency options (stored value = display label) */
export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every other day',
  'Once weekly',
  'Twice weekly',
  'As needed (PRN)',
] as const;

export type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number];

// Colors – light mode (purple/white theme from reference)
export const COLORS = {
  // Primary accent (vibrant purple #7B61FF)
  primary: '#7B61FF',
  primaryDark: '#5a4ad4',
  primaryLight: '#9d8aff',
  primaryContrast: '#ffffff', // text on primary background (e.g. selected calendar day)
  secondary: '#14b8b8',
  // Backgrounds
  background: '#F8F8FA',
  backgroundDark: '#121212',
  // Text
  text: '#212121',
  textDark: '#ffffff',
  textSecondary: '#757575',
  textSecondaryDark: '#aaaaaa',
  // Semantic
  health: '#ef4444',
  healthGood: '#22c55e',
  hunger: '#f97316',
  happiness: '#eab308',
  error: '#ef4444',
  success: '#22c55e',
  // Borders & surfaces
  border: '#e5e7eb',
  borderDark: '#374151',
  modalOverlay: 'rgba(0,0,0,0.5)',
  // Light purple / lavender for cards (#EDE9FC)
  cardLight: '#EDE9FC',
  cardLightDark: '#2d2a3d',
  // Tamagotchi screen (purple/teal)
  tamagotchiPurple: '#7B61FF',
  tamagotchiPurpleLight: '#a78bfa',
  tamagotchiTeal: '#14b8a6',
  tamagotchiTealLight: '#5eead4',
  tamagotchiPink: '#ec4899',
  tamagotchiBgStart: '#5b21b6',
  tamagotchiBgEnd: '#0e7490',
} as const;
