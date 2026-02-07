import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTamagotchiContext } from '../contexts/TamagotchiContext';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AnimatedAvatar } from '../components/AnimatedAvatar';
import { COLORS } from '../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AVATAR_SECTION_HEIGHT = SCREEN_HEIGHT * 0.6;

export const HomeScreen: React.FC = () => {
  const { tamagotchi, loading, error } = useTamagotchiContext();
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();

  const handleAccountPress = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleLeaderboardPress = () => {
    navigation.navigate('Leaderboard');
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

  // Points: 0-100, resets at 100
  const pointsValue = tamagotchi.health;
  // Streak: 0-30 days, resets at 30
  const streakDays = Math.min(30, tamagotchi.total_interactions_this_week);
  const streakBarPercent = (streakDays / 30) * 100;

  const statBarBgLight = {
    points: '#7B61FF',
    streak: '#14b8a6',
    happiness: '#7B61FF',
  };
  const statBarBgDark = {
    points: '#6d4ee6',
    streak: '#0d9488',
    happiness: '#6d4ee6',
  };
  const statBarTrack = isDark ? statBarBgDark : statBarBgLight;
  // High-contrast white fill for Points and Streak so empty vs full is obvious
  const statBarFill = '#ffffff';
  const statLabelColor = '#fff';

  // Happiness: always 100% bar, color indicates level (green=high, yellow=med, red=low)
  const getHappinessColor = () => {
    const h = tamagotchi.happiness;
    if (h >= 70) return COLORS.healthGood; // green
    if (h >= 40) return COLORS.hunger; // orange/yellow
    return COLORS.health; // red
  };

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
            style={[styles.headerIconButton, styles.headerIconCircle, isDark && styles.headerIconCircleDark]}
            onPress={handleAccountPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerIcon, isDark && styles.headerIconDark]}>👤</Text>
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={[styles.headerIconButton, styles.headerIconCircle, isDark && styles.headerIconCircleDark]}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerIcon, isDark && styles.headerIconDark]}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar section – 60% of screen */}
        <View style={[styles.avatarSection, isDark && styles.avatarSectionDark]}>
          <AnimatedAvatar
            avatar={tamagotchi.avatar}
            name={tamagotchi.name}
            actionTrigger={null}
            isDark={isDark}
          />
        </View>

        {/* Points, Streak, Happiness – with colored backgrounds */}
        <View style={[styles.statsSection, isDark && styles.statsSectionDark]}>
          <View style={[styles.statBar, { backgroundColor: statBarTrack.points }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <View style={styles.statBarWrapper}>
              <ProgressBar
                value={pointsValue}
                label={`Points: ${pointsValue}/100`}
                color={statBarFill}
                showPercentage={false}
                trackColor={statBarTrack.points}
                labelColor={statLabelColor}
              />
            </View>
          </View>
          <View style={[styles.statBar, { backgroundColor: statBarTrack.streak }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <View style={styles.statBarWrapper}>
              <ProgressBar
                value={streakBarPercent}
                label={`Streak: ${streakDays}/30 Days`}
                color={statBarFill}
                showPercentage={false}
                trackColor={statBarTrack.streak}
                labelColor={statLabelColor}
              />
            </View>
          </View>
          <View style={[styles.statBar, { backgroundColor: statBarTrack.happiness }]}>
            <Text style={styles.statIcon}>❤️</Text>
            <View style={styles.statBarWrapper}>
              <ProgressBar
                value={100}
                label={`Happiness: ${tamagotchi.happiness}%`}
                color={getHappinessColor()}
                showPercentage={false}
                trackColor={statBarTrack.happiness}
                labelColor={statLabelColor}
                alwaysFullColor
              />
            </View>
          </View>
        </View>

        {/* Bottom: Cosmetics + Leaderboard */}
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
            onPress={handleLeaderboardPress}
            activeOpacity={0.8}
          >
            <Text style={styles.circleButtonIcon}>🏆</Text>
            <Text style={styles.circleButtonLabel}>Leaderboard</Text>
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
  headerIconButton: {
    padding: 8,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 97, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerIconCircleDark: {
    backgroundColor: 'rgba(123, 97, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerIcon: {
    fontSize: 22,
  },
  headerIconDark: {
    opacity: 0.95,
  },
  headerSpacer: {
    flex: 1,
  },
  avatarSection: {
    width: '100%',
    height: AVATAR_SECTION_HEIGHT,
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: COLORS.tamagotchiBgStart,
  },
  avatarSectionDark: {
    backgroundColor: '#4c1d95',
  },
  statsSection: {
    width: '100%',
    marginBottom: 24,
  },
  statsSectionDark: {},
  statBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
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
