import { StyleSheet, Text, View } from 'react-native';
import { GameHistoryEntry } from '@org/game-engine';
import { theme } from '../../../theme/theme';

export interface GameHistoryRowProps {
  entry: GameHistoryEntry;
}

function formatGameDate(startedAt: number): string {
  return new Date(startedAt).toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function GameHistoryRow({ entry }: GameHistoryRowProps) {
  const { session, score } = entry;
  const isAbandoned = session.completedAt === null;

  return (
    <View style={styles.row} testID={`game-history-row-${session.id}`}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatGameDate(session.startedAt)}</Text>
        {isAbandoned && (
          <View style={styles.badge} testID="game-history-row-abandoned-badge">
            <Text style={styles.badgeLabel}>Abandoned</Text>
          </View>
        )}
      </View>
      <Text style={styles.ratio}>{Math.round(score.ratio * 100)}%</Text>
      <Text style={styles.counts}>
        {score.correct} correct, {score.almost} almost, {score.incorrect} incorrect
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    ...theme.shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[600],
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[100],
  },
  badgeLabel: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[600],
  },
  ratio: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primaryDark,
  },
  counts: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.neutral[600],
  },
});
