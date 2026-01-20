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

// Colors
export const COLORS = {
  primary: '#0a7c7c',
  primaryDark: '#065a5a',
  primaryLight: '#0fa0a0',
  secondary: '#14b8b8',
  background: '#ffffff',
  backgroundDark: '#121212',
  text: '#000000',
  textDark: '#ffffff',
  textSecondary: '#666666',
  textSecondaryDark: '#aaaaaa',
  health: '#ef4444',
  healthGood: '#22c55e',
  hunger: '#f97316',
  happiness: '#eab308',
  error: '#ef4444',
  success: '#22c55e',
  border: '#e5e7eb',
  borderDark: '#374151',
} as const;
