import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PetCreationScreen } from '../screens/PetCreationScreen';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RootStackParamList, MainTabParamList } from '../types';
import { useColorScheme } from 'react-native';
import { COLORS } from '../utils/constants';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabBarIcon name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabBarIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component using emojis
const TabBarIcon: React.FC<{ name: string; color: string; size: number }> = ({
  name,
}: {
  name: string;
  color: string;
  size: number;
}) => {
  const icons: Record<string, string> = {
    home: '🏠',
    trophy: '🏆',
    settings: '⚙️',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
};

export const AppNavigator: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { tamagotchi, loading: tamagotchiLoading } = useTamagotchi(
    user?.id || null
  );

  if (authLoading || (user && tamagotchiLoading)) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !tamagotchi ? (
          <Stack.Screen name="PetCreation" component={PetCreationScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
