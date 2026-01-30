import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTamagotchiContext } from '../contexts/TamagotchiContext';
import { useAuth } from '../hooks/useAuth';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import { COLORS } from '../utils/constants';
import { StatAction } from '../types';

export const HomeScreen: React.FC = () => {
  const { tamagotchi, loading, performAction, error } = useTamagotchiContext();
  const { userData } = useAuth();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const [showCareActions, setShowCareActions] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState<StatAction | null>(null);

  const handleAction = async (action: StatAction) => {
    setAnimationTrigger(action);
    try {
      await performAction(action);
      setShowCareActions(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to perform action');
    }
  };

  const clearAnimationTrigger = () => {
    setAnimationTrigger(null);
  };

  const handleAccountPress = () => {
    navigation.navigate('Settings');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleCosmeticsPress = () => {
    Alert.alert('Cosmetics', 'Cosmetics menu coming soon!');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your Tamagotchi..." />;
  }

  if (!tamagotchi) {
    return (
      <View style={[styles.container, styles.centerContent, isDark && styles.containerDark]}>
        <Text style={[styles.noPetText, isDark && styles.noPetTextDark]}>
          No Tamagotchi found. Please create one in Settings.
        </Text>
      </View>
    );
  }

  const getHealthColor = (value: number) =>
    value >= 50 ? COLORS.healthGood : COLORS.health;

  // Streak: use total interactions this week as a "weekly streak" (bar 0–100)
  const streakValue = Math.min(100, tamagotchi.total_interactions_this_week * 10);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar: Account (left), Settings (right) */}
        <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleAccountPress}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>👤</Text>
          <Text style={[styles.headerLabel, isDark && styles.headerLabelDark]}>
            Account
          </Text>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSettingsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={[styles.headerLabel, isDark && styles.headerLabelDark]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated avatar – reacts to feed / play / sleep */}
      <AnimatedAvatar
        avatar={tamagotchi.avatar}
        name={tamagotchi.name}
        actionTrigger={animationTrigger}
        onAnimationComplete={clearAnimationTrigger}
        isDark={isDark}
      />

      {/* Health, Streak, Happiness bars */}
      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <Text style={styles.statIcon}>⭐</Text>
          <View style={styles.statBarWrapper}>
            <ProgressBar
              value={tamagotchi.health}
              label={`Health: ${tamagotchi.health}%`}
              color={COLORS.tamagotchiPurple}
              showPercentage={false}
            />
          </View>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statIcon}>🔥</Text>
          <View style={styles.statBarWrapper}>
            <ProgressBar
              value={streakValue}
              label={`Streak: ${tamagotchi.total_interactions_this_week} this week`}
              color={COLORS.tamagotchiTeal}
              showPercentage={false}
            />
          </View>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statIcon}>❤️</Text>
          <View style={styles.statBarWrapper}>
            <ProgressBar
              value={tamagotchi.happiness}
              label={`Happiness: ${tamagotchi.happiness}%`}
              color={COLORS.tamagotchiPurpleLight}
              showPercentage={false}
            />
          </View>
        </View>
      </View>

      {/* Care actions (Feed, Play, Sleep) - expandable */}
      {showCareActions && (
        <View style={[styles.careActionsBar, isDark && styles.careActionsBarDark]}>
          <Button
            title="🍎 Feed"
            onPress={() => handleAction('feed')}
            variant="primary"
            style={styles.careButton}
          />
          <Button
            title="🎮 Play"
            onPress={() => handleAction('play')}
            variant="secondary"
            style={styles.careButton}
          />
          <Button
            title="😴 Sleep"
            onPress={() => handleAction('sleep')}
            variant="primary"
            style={styles.careButton}
          />
        </View>
      )}

      {/* Bottom: Cosmetics + Care (navigation / cosmetic menu) */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={[styles.circleButton, styles.circleButtonPurple]}
          onPress={handleCosmeticsPress}
          activeOpacity={0.8}
        >
          <Text style={styles.circleButtonIcon}>✨</Text>
          <Text style={styles.circleButtonLabel}>Cosmetics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.circleButton, styles.circleButtonTeal]}
          onPress={() => setShowCareActions(!showCareActions)}
          activeOpacity={0.8}
        >
          <Text style={styles.circleButtonIcon}>🍎</Text>
          <Text style={styles.circleButtonLabel}>Care</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      </ScrollView>
    </SafeAreaView>
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
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  headerDark: {},
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  headerLabel: {
    fontSize: 14,
    color: COLORS.tamagotchiPurple,
    fontWeight: '600',
  },
  headerLabelDark: {
    color: COLORS.tamagotchiPurpleLight,
  },
  headerSpacer: {
    flex: 1,
  },
  statsSection: {
    width: '100%',
    marginBottom: 28,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 28,
    marginRight: 12,
    width: 36,
    textAlign: 'center',
  },
  statBarWrapper: {
    flex: 1,
  },
  careActionsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  careActionsBarDark: {
    backgroundColor: COLORS.borderDark,
  },
  careButton: {
    minWidth: 90,
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  circleButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  circleButtonPurple: {
    backgroundColor: COLORS.tamagotchiPurple,
  },
  circleButtonTeal: {
    backgroundColor: COLORS.tamagotchiTeal,
  },
  circleButtonIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  circleButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
