# Tamagotchi Leaderboard App

A React Native mobile application built with Expo for caring for virtual Tamagotchi pets and competing on a leaderboard.

## Features

- 🔐 **Authentication**: Email/password sign up and login
- 🐾 **Tamagotchi Care**: Create and care for your virtual pet
- 📊 **Real-time Stats**: Track health, hunger, and happiness
- 🏆 **Leaderboard**: Compete with other users based on weekly interactions
- ⚙️ **Settings**: Customize username and pet name
- 🌙 **Dark Mode**: Automatic dark mode support

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase Firestore** for database
- **Firebase Authentication** for user management
- **React Navigation** for routing

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project

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

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password provider
   - Create a Firestore database
   - Copy your Firebase config to `src/config/firebase.ts`
   - Deploy Firestore rules from `firestore.rules`

4. Update Firebase configuration:
   - Open `src/config/firebase.ts`
   - Replace the placeholder values with your Firebase config:
     ```typescript
     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     };
     ```

5. Start the development server:
```bash
npm start
```

6. Run on your device:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── ProgressBar.tsx
├── config/             # Configuration files
│   └── firebase.ts     # Firebase initialization
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useTamagotchi.ts
│   └── useLeaderboard.ts
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
```

## Data Model

### Users Collection
- `uid`: Unique user ID (Firebase Auth UID)
- `username`: Display name
- `email`: User email
- `createdAt`: Timestamp

### Tamagotchis Collection
- `id`: Unique pet ID
- `ownerId`: Reference to user UID
- `name`: Pet name
- `health`: Health stat (0-100)
- `hunger`: Hunger stat (0-100)
- `happiness`: Happiness stat (0-100)
- `avatar`: Emoji avatar
- `createdAt`: Creation timestamp
- `lastInteractionTime`: Last action timestamp
- `totalInteractionsThisWeek`: Weekly interaction counter

## Game Mechanics

### Actions
- **Feed**: Hunger -30, Happiness +10, Health +5
- **Play**: Hunger -20, Happiness +30, Health -5
- **Sleep**: Hunger -10, Health +50, Happiness +50

All stats are clamped between 0-100.

## Firebase Security Rules

The app includes Firestore security rules that:
- Allow users to read/write their own user data
- Allow authenticated users to read all tamagotchis (for leaderboard)
- Prevent unauthorized writes to tamagotchis

Deploy rules using:
```bash
firebase deploy --only firestore:rules
```

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

## License

This project is created for educational purposes as part of a biomedical engineering capstone project.
