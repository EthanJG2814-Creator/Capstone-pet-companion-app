# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Sign-in method → Email/Password
   - Create Firestore Database (start in test mode, then deploy rules)
   - Go to Project Settings → General → Your apps → Add app (Web)
   - Copy your Firebase config values

3. **Configure Firebase**
   - Open `src/config/firebase.ts`
   - Replace placeholder values with your Firebase config:
     ```typescript
     const firebaseConfig = {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     };
     ```

4. **Deploy Firestore Rules**
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login: `firebase login`
   - Initialize: `firebase init firestore`
   - Deploy rules: `firebase deploy --only firestore:rules`
   - Or manually copy `firestore.rules` content to Firebase Console → Firestore Database → Rules

5. **Start Development Server**
   ```bash
   npm start
   ```

6. **Run on Device**
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - Or press `i` for iOS simulator / `a` for Android emulator

## Testing the App

1. **Create Account**
   - Sign up with email/password
   - Enter a username

2. **Create Tamagotchi**
   - Choose a name and avatar
   - Click "Create Tamagotchi"

3. **Interact with Pet**
   - Use Feed, Play, and Sleep buttons
   - Watch stats change in real-time

4. **View Leaderboard**
   - See top 10 pets ranked by interactions
   - Pull down to refresh

5. **Update Settings**
   - Change username
   - Rename your pet
   - Sign out

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase config values are correct
- Check internet connection
- Ensure Firestore rules are deployed

### Navigation Issues
- Clear app cache: `expo start -c`
- Restart development server

### Type Errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version matches package.json

## Project Structure

- `src/components/` - Reusable UI components
- `src/screens/` - Screen components
- `src/hooks/` - Custom React hooks
- `src/navigation/` - Navigation setup
- `src/config/` - Configuration files
- `src/types/` - TypeScript definitions
- `src/utils/` - Utility functions

## Next Steps

- Add more avatar options
- Implement weekly reset for interactions
- Add pet evolution system
- Add achievements/badges
- Implement push notifications for pet care reminders
