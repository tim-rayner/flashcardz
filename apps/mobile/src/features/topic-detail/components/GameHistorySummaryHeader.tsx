import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface GameHistorySummaryHeaderProps {
  gamesPlayed: number;
  averageRatio: number;
}

export function GameHistorySummaryHeader({
  gamesPlayed,
  averageRatio,
}: GameHistorySummaryHeaderProps) {
  return (
    <View style={styles.container} testID="game-history-summary-header">
      <Text style={styles.stat}>Games played: {gamesPlayed}</Text>
      <Text style={styles.stat}>Avg ratio: {Math.round(averageRatio * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  stat: {
    fontSize: theme.typography.bodyEmph.fontSize,
    lineHeight: theme.typography.bodyEmph.lineHeight,
    fontWeight: theme.typography.bodyEmph.fontWeight,
    color: theme.colors.neutral[800],
  },
});
