import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { EmptyGameHistoryView } from './components/EmptyGameHistoryView';
import { GameHistoryRow } from './components/GameHistoryRow';
import { GameHistorySummaryHeader } from './components/GameHistorySummaryHeader';
import { useTopicGameHistory } from './hooks/useTopicGameHistory';

export interface PerformanceScreenProps {
  topicId: string;
}

export function PerformanceScreen({ topicId }: PerformanceScreenProps) {
  const { summary, isLoading, isRefreshing, refresh } = useTopicGameHistory(topicId);

  if (isLoading) {
    return (
      <View style={styles.centered} testID="performance-loading">
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (summary.entries.length === 0) {
    return <EmptyGameHistoryView />;
  }

  return (
    <FlatList
      testID="game-history-list"
      style={styles.container}
      data={summary.entries}
      keyExtractor={(entry) => entry.session.id}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <GameHistorySummaryHeader
          gamesPlayed={summary.gamesPlayed}
          averageRatio={summary.averageRatio}
        />
      }
      renderItem={({ item }) => <GameHistoryRow entry={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={theme.colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
