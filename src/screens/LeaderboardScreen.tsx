import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LeaderboardEntry } from '../types';
import { COLORS } from '../utils/constants';

const LeaderboardItem: React.FC<{ entry: LeaderboardEntry; isDark: boolean }> = ({
  entry,
  isDark,
}) => {
  return (
    <View style={[styles.item, isDark && styles.itemDark]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, isDark && styles.rankDark]}>
          #{entry.rank}
        </Text>
      </View>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarEmoji}>{entry.tamagotchi.avatar}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.petName, isDark && styles.petNameDark]}>
          {entry.tamagotchi.name}
        </Text>
        <Text style={[styles.ownerName, isDark && styles.ownerNameDark]}>
          {entry.ownerUsername}
        </Text>
      </View>
      <View style={styles.statsContainer}>
        <Text style={[styles.interactions, isDark && styles.interactionsDark]}>
          {entry.tamagotchi.total_interactions_this_week}
        </Text>
        <Text style={[styles.interactionsLabel, isDark && styles.interactionsLabelDark]}>
          interactions
        </Text>
      </View>
    </View>
  );
};

export const LeaderboardScreen: React.FC = () => {
  const { entries, loading, error, refreshing, refresh } = useLeaderboard();
  const { isDark } = useTheme();

  if (loading && entries.length === 0) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.centeredWrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Leaderboard
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Top {entries.length} Tamagotchis this week
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No pets on the leaderboard yet. Be the first!
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.tamagotchi.id}
            renderItem={({ item }) => (
              <LeaderboardItem entry={item} isDark={isDark} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        )}
      </View>
    </View>
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
  centeredWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  titleDark: {
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  subtitleDark: {
    color: COLORS.textSecondaryDark,
  },
  list: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemDark: {
    backgroundColor: COLORS.backgroundDark,
    borderColor: COLORS.borderDark,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  rankDark: {
    color: COLORS.primaryLight,
  },
  avatarContainer: {
    marginHorizontal: 12,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  petNameDark: {
    color: COLORS.textDark,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  ownerNameDark: {
    color: COLORS.textSecondaryDark,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  interactions: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  interactionsDark: {
    color: COLORS.primaryLight,
  },
  interactionsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  interactionsLabelDark: {
    color: COLORS.textSecondaryDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyTextDark: {
    color: COLORS.textSecondaryDark,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
