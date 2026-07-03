import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { theme } from '../../../theme/theme';
import { Topic } from '../../../utils/storage/onboard-store';
import { TopicCard } from './TopicCard';

export interface TopicListProps {
  topics: Topic[];
  onSelectTopic?: (topic: Topic) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const NUM_COLUMNS = 2;
const HORIZONTAL_PADDING = theme.spacing.lg;
const CARD_GAP = theme.spacing.md;

/**
 * A lone card in an incomplete last row would otherwise stretch to fill the
 * whole row width, ending up bigger than every other card. Padding with an
 * invisible spacer keeps every row at a full NUM_COLUMNS items so all real
 * cards stay the same size.
 */
function padToFullRow(topics: Topic[]): (Topic | null)[] {
  const remainder = topics.length % NUM_COLUMNS;
  if (remainder === 0) return topics;
  return [...topics, ...Array<null>(NUM_COLUMNS - remainder).fill(null)];
}

export function TopicList({ topics, onSelectTopic, isRefreshing, onRefresh }: TopicListProps) {
  const { width } = useWindowDimensions();
  const cardSize = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <FlatList
      key={`topic-list-${NUM_COLUMNS}`}
      testID="topic-list"
      data={padToFullRow(topics)}
      numColumns={NUM_COLUMNS}
      keyExtractor={(topic, index) => topic?.id ?? `spacer-${index}`}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) =>
        item ? (
          <TopicCard topic={item} onPress={onSelectTopic} size={cardSize} />
        ) : (
          <View style={{ width: cardSize }} />
        )
      }
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
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: CARD_GAP,
  },
  row: {
    gap: CARD_GAP,
  },
});
