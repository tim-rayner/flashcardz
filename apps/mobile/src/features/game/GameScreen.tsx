import { useEffect, useMemo, useState } from 'react';
import { router, Stack } from 'expo-router';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';
import { CardStatusFilter } from '../topic-detail/utils/cardStatus';
import { GamePlayView } from './components/GamePlayView';
import { gameRepository } from './data/gameRepository';
import { useTopicGameCards } from './hooks/useTopicGameCards';

export interface GameScreenProps {
  topicId: string;
  filter: CardStatusFilter;
  /** Continues an abandoned Game instead of starting a fresh one. */
  resumeSessionId?: string;
}

export function GameScreen({ topicId, filter, resumeSessionId }: GameScreenProps) {
  // Sessions don't record which filter they were started with, so Resume
  // always works from the full card set minus what's already graded.
  const { cards, isLoading: isLoadingCards } = useTopicGameCards(
    topicId,
    resumeSessionId ? 'all' : filter,
  );
  const [gradedCardIds, setGradedCardIds] = useState<Set<string> | null>(
    resumeSessionId ? null : new Set(),
  );

  useEffect(() => {
    if (!resumeSessionId) {
      setGradedCardIds(new Set());
      return;
    }
    let cancelled = false;
    gameRepository.listResultsForSession(resumeSessionId).then((results) => {
      if (cancelled) return;
      setGradedCardIds(new Set(results.map((result) => result.cardId)));
    });
    return () => {
      cancelled = true;
    };
  }, [resumeSessionId]);

  const remainingCards = useMemo(
    () => (gradedCardIds ? cards.filter((card) => !gradedCardIds.has(card.id)) : []),
    [cards, gradedCardIds],
  );
  const isLoading = isLoadingCards || gradedCardIds === null;

  const handleComplete = (sessionId: string) => {
    router.replace(
      `/topics/${topicId}/game/summary?sessionId=${sessionId}&filter=${filter}`,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Game' }} />
      {isLoading ? (
        <View style={styles.centered} testID="game-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : remainingCards.length === 0 ? (
        <View style={styles.centered} testID="game-empty">
          <Text style={styles.emptyText}>No cards to play.</Text>
        </View>
      ) : (
        <GamePlayView
          topicId={topicId}
          cards={remainingCards}
          onComplete={handleComplete}
          resumeSessionId={resumeSessionId}
          progressOffset={gradedCardIds?.size ?? 0}
          totalCount={cards.length}
        />
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
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.neutral[400],
    textAlign: 'center',
  },
});
