import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTamagotchi } from '../hooks/useTamagotchi';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS } from '../utils/constants';
import { StatAction } from '../types';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { tamagotchi, loading, performAction, error } = useTamagotchi(
    user?.uid || null
  );
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAction = async (action: StatAction) => {
    try {
      await performAction(action);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to perform action');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your Tamagotchi..." />;
  }

  if (!tamagotchi) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.noPetText, isDark && styles.noPetTextDark]}>
          No Tamagotchi found. Please create one in Settings.
        </Text>
      </View>
    );
  }

  // Determine health color based on value
  const getHealthColor = (value: number) => {
    return value >= 50 ? COLORS.healthGood : COLORS.health;
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.petCard}>
        <Text style={styles.avatar}>{tamagotchi.avatar}</Text>
        <Text style={[styles.petName, isDark && styles.petNameDark]}>
          {tamagotchi.name}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <ProgressBar
          value={tamagotchi.health}
          label="Health"
          color={getHealthColor(tamagotchi.health)}
        />
        <ProgressBar
          value={tamagotchi.hunger}
          label="Hunger"
          color={COLORS.hunger}
        />
        <ProgressBar
          value={tamagotchi.happiness}
          label="Happiness"
          color={COLORS.happiness}
        />
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="🍎 Feed"
          onPress={() => handleAction('feed')}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="🎮 Play"
          onPress={() => handleAction('play')}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="😴 Sleep"
          onPress={() => handleAction('sleep')}
          variant="primary"
          style={styles.actionButton}
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  petCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 12,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  petNameDark: {
    color: COLORS.textDark,
  },
  statsContainer: {
    marginBottom: 32,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  noPetText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  noPetTextDark: {
    color: COLORS.textSecondaryDark,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});
