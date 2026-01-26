# Tamagotchi Leaderboard App

A React Native mobile application built with Expo for caring for virtual Tamagotchi pets and competing on a leaderboard.

## Features

- 🔐 **Authentication**: Email/password sign up and login with Supabase Auth
- 🐾 **Tamagotchi Care**: Create and care for your virtual pet
- 📊 **Real-time Stats**: Track health, hunger, and happiness with live updates
- 🏆 **Leaderboard**: Compete with other users based on weekly interactions
- ⚙️ **Settings**: Customize username and pet name
- 🌙 **Dark Mode**: Automatic dark mode support
- 🔄 **Real-time Updates**: See leaderboard and pet stats update instantly

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** (PostgreSQL database + authentication)
- **Supabase Real-time** for live updates
- **React Navigation** for routing

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Stupid_Capstone_V2
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API
   - Create `.env` file in the root:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Set up database:
   - Open Supabase SQL Editor
   - Run migrations from `supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`
     - `003_weekly_reset_function.sql`
   - Enable real-time replication for `tamagotchis` table (Database → Replication)

5. Start the development server:
```bash
npm start
```

6. Run on your device:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── ProgressBar.tsx
├── config/             # Configuration files
│   └── supabase.ts     # Supabase client initialization
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useTamagotchi.ts # Tamagotchi management with real-time
│   └── useLeaderboard.ts # Leaderboard with real-time updates
├── navigation/         # Navigation setup
│   └── AppNavigator.tsx
├── screens/            # Screen components
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LeaderboardScreen.tsx
│   ├── PetCreationScreen.tsx
│   └── SettingsScreen.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    ├── constants.ts
    └── helpers.ts

supabase/
└── migrations/         # Database migration SQL files
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    └── 003_weekly_reset_function.sql
```

## Data Model

### Users Table
- `id`: UUID (references auth.users)
- `username`: Display name (unique)
- `email`: User email (unique)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Tamagotchis Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `name`: Pet name
- `health`: Health stat (0-100)
- `hunger`: Hunger stat (0-100)
- `happiness`: Happiness stat (0-100)
- `avatar`: Emoji avatar
- `created_at`: Creation timestamp
- `last_interaction_time`: Last action timestamp
- `total_interactions_this_week`: Weekly interaction counter
- `is_alive`: Boolean flag

## Game Mechanics

### Actions
- **Feed**: Hunger -30, Happiness +10, Health +5
- **Play**: Hunger -20, Happiness +30, Health -5
- **Sleep**: Hunger -10, Health +50, Happiness +50

All stats are clamped between 0-100. Each action increments `total_interactions_this_week` and updates `last_interaction_time`.

## Security

The app uses Supabase Row Level Security (RLS) policies:
- Users can read/write their own user profile
- Users can create/update/delete their own tamagotchi
- All authenticated users can read all tamagotchis (for leaderboard)
- All users can read usernames (for leaderboard display)
- Prevents unauthorized writes to other users' data

## Real-time Features

- **Pet Stats**: Updates automatically when you interact with your pet
- **Leaderboard**: Updates in real-time when other users interact with their pets
- Uses Supabase Realtime subscriptions via PostgreSQL change streams

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
expo build:android
expo build:ios
```

## Migration from Firebase

If you're migrating from Firebase, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

## License

This project is created for educational purposes as part of a biomedical engineering capstone project.
