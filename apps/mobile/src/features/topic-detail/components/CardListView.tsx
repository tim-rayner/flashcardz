import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';
import { CardWithStatus } from '../hooks/useTopicCards';
import { CardRow } from './CardRow';

export interface CardListViewProps {
  cards: CardWithStatus[];
  onSelectCard: (card: CardWithStatus) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function CardListView({
  cards,
  onSelectCard,
  isRefreshing,
  onRefresh,
}: CardListViewProps) {
  if (cards.length === 0) {
    return (
      <View style={styles.emptyFilter} testID="card-list-empty-filter">
        <Text style={styles.emptyFilterText}>No cards match this filter</Text>
      </View>
    );
  }

  return (
    <FlatList
      testID="card-list"
      style={styles.list}
      data={cards}
      keyExtractor={(card) => card.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <CardRow card={item} onPress={onSelectCard} />}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyFilter: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyFilterText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
});
