import { useGameSummary } from '@org/game-engine';
import { router, Stack } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';
import { CardStatusFilter } from '../topic-detail/utils/cardStatus';
import { gameRepository } from './data/gameRepository';

export interface GameSummaryScreenProps {
  topicId: string;
  sessionId: string;
  filter: CardStatusFilter;
}

export function GameSummaryScreen({ topicId, sessionId, filter }: GameSummaryScreenProps) {
  const { isLoading, score } = useGameSummary({ sessionId, repository: gameRepository });

  const handlePlayAgain = () => {
    router.replace(`/topics/${topicId}/game?filter=${filter}`);
  };

  const handleDone = () => {
    // Pops back to the Topic Detail screen already in the stack rather than
    // replacing it with a fresh instance - a fresh instance would leave the
    // original mounted (but unfocused) underneath, stuck with whatever
    // abandoned-game state it last computed before this game was played.
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Results' }} />
      {isLoading ? (
        <View style={styles.centered} testID="summary-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.content} testID="game-summary">
          <Text style={styles.ratio} testID="summary-ratio">
            {Math.round(score.ratio * 100)}%
          </Text>
          <View style={styles.counts}>
            <Text style={styles.countLine} testID="summary-correct">
              Correct: {score.correct}
            </Text>
            <Text style={styles.countLine} testID="summary-almost">
              Almost: {score.almost}
            </Text>
            <Text style={styles.countLine} testID="summary-incorrect">
              Incorrect: {score.incorrect}
            </Text>
          </View>
          <Pressable
            onPress={handlePlayAgain}
            accessibilityRole="button"
            testID="summary-play-again"
            style={styles.primaryButton}
          >
            <Text style={styles.primaryLabel}>Play again</Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            accessibilityRole="button"
            testID="summary-done"
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryLabel}>Done</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  ratio: {
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.typography.display.fontWeight,
    color: theme.colors.primaryDark,
  },
  counts: {
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  countLine: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.neutral[600],
  },
  primaryButton: {
    alignSelf: 'stretch',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
  secondaryButton: {
    alignSelf: 'stretch',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[600],
  },
});
