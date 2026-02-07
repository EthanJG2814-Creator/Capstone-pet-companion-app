import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { TamagotchiProvider, useTamagotchiContext } from '../contexts/TamagotchiContext';
import { MedicationsProvider } from '../contexts/MedicationsContext';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PetCreationScreen } from '../screens/PetCreationScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CustomTabBar } from '../components/CustomTabBar';
import { TabScreenWithAnimation } from '../components/TabScreenWithAnimation';
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
  ScheduleSettingsScreen,
  MedicationScheduleCalendarScreen,
} from '../screens/medication';
import {
  RootStackParamList,
  MainTabParamList,
  MedicationStackParamList,
  ScheduleStackParamList,
} from '../types';

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const MedicationStack = createStackNavigator<MedicationStackParamList>();
const ScheduleStack = createStackNavigator<ScheduleStackParamList>();

function HomeScreenWithAnimation() {
  return (
    <TabScreenWithAnimation tabIndex={0}>
      <HomeScreen />
    </TabScreenWithAnimation>
  );
}

function MedicationsTabWithAnimation() {
  return (
    <TabScreenWithAnimation tabIndex={1}>
      <MedicationStackNavigator />
    </TabScreenWithAnimation>
  );
}

function ScheduleTabWithAnimation() {
  return (
    <TabScreenWithAnimation tabIndex={2}>
      <ScheduleStackNavigator />
    </TabScreenWithAnimation>
  );
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

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <ScheduleStack.Screen
        name="MedicationScheduleCalendar"
        component={MedicationScheduleCalendarScreen}
        options={{ title: 'Schedule', headerShown: false }}
      />
      <ScheduleStack.Screen
        name="ScheduleSettings"
        component={ScheduleSettingsScreen}
        options={{ title: 'Schedule settings' }}
      />
    </ScheduleStack.Navigator>
  );
}

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenWithAnimation}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationsTabWithAnimation}
        options={{ tabBarLabel: 'Medications' }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleTabWithAnimation}
        options={{ tabBarLabel: 'Schedule' }}
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
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
          <RootStack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ headerShown: true, title: 'Leaderboard', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }}
          />
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
