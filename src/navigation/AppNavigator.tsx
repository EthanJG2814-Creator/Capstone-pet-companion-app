import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { TamagotchiProvider, useTamagotchiContext } from '../contexts/TamagotchiContext';
import { MedicationsProvider } from '../contexts/MedicationsContext';
import { useTheme } from '../contexts/ThemeContext';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PetCreationScreen } from '../screens/PetCreationScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS } from '../utils/constants';
import {
  MedicationsHomeScreen,
  MedicationDetailsScreen,
  MedicationReviewScreen,
  MedicationScheduleScreen,
  MedicationConfirmationScreen,
  LinkRFIDScreen,
  MedicationLabelCaptureScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  ScheduleCalendarScreen,
  ScheduleSettingsScreen,
} from '../screens/medication';
import {
  RootStackParamList,
  MainTabParamList,
  MedicationStackParamList,
  Medication,
} from '../types';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MedicationStack = createStackNavigator<MedicationStackParamList>();

function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    home: '🏠',
    trophy: '🏆',
    medication: '💊',
    settings: '⚙️',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
}

function MedicationStackNavigator() {
  return (
    <MedicationStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <MedicationStack.Screen
        name="MedicationsHome"
        component={MedicationsHomeScreen}
        options={{ title: 'Medications' }}
      />
      <MedicationStack.Screen
        name="MedicationDetails"
        component={MedicationDetailsScreen}
        options={{ title: 'Details' }}
      />
      <MedicationStack.Screen
        name="MedicationReview"
        component={MedicationReviewScreen}
        options={{ title: 'Add / Edit medication' }}
      />
      <MedicationStack.Screen
        name="MedicationSchedule"
        component={MedicationScheduleScreen}
        options={{ title: 'Set reminders' }}
      />
      <MedicationStack.Screen
        name="MedicationConfirmation"
        component={MedicationConfirmationScreen}
        options={{ title: 'Log dose' }}
      />
      <MedicationStack.Screen
        name="LinkRFID"
        component={LinkRFIDScreen}
        options={{ title: 'Link RFID' }}
      />
      <MedicationStack.Screen
        name="MedicationLabelCapture"
        component={MedicationLabelCaptureScreen}
        options={{ title: 'Scan label' }}
      />
    </MedicationStack.Navigator>
  );
}

const MainTabs: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.backgroundDark : COLORS.background,
          borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="trophy" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationStackNavigator}
        options={{
          tabBarLabel: 'Medications',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="medication" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="settings" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

/** Inner navigator: PetCreation | Main tabs + medication/schedule screens */
const AuthenticatedStack: React.FC = () => {
  const { tamagotchi, loading: tamagotchiLoading } = useTamagotchiContext();

  if (tamagotchiLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!tamagotchi ? (
        <RootStack.Screen name="PetCreation" component={PetCreationScreen} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
            options={{ headerShown: true, title: 'Edit profile', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
          <RootStack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
            options={{ headerShown: true, title: 'Change password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
          <RootStack.Screen
            name="ScheduleCalendar"
            component={ScheduleCalendarScreen}
            options={{ headerShown: true, title: 'Schedule', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
          <RootStack.Screen
            name="ScheduleSettings"
            component={ScheduleSettingsScreen}
            options={{ headerShown: true, title: 'Schedule settings', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Auth" component={AuthScreen} />
        </RootStack.Navigator>
      ) : (
        <TamagotchiProvider userId={user.id}>
          <MedicationsProvider userId={user.id}>
            <AuthenticatedStack />
          </MedicationsProvider>
        </TamagotchiProvider>
      )}
    </NavigationContainer>
  );
}
