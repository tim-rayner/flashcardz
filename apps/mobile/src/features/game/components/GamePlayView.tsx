import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GameCard, Result, useGameSession } from '@org/game-engine';
import { theme } from '../../../theme/theme';
import { gameRepository } from '../data/gameRepository';
import { cardRepository } from '../data/cardRepository';

export interface GamePlayViewProps {
  topicId: string;
  cards: GameCard[];
  onComplete: (sessionId: string) => void;
  resumeSessionId?: string;
  /** Cards from the book already accounted for before this view's card list (e.g. graded before a resume). */
  progressOffset?: number;
  /** Total cards in the book this game is playing through; defaults to `cards.length`. */
  totalCount?: number;
}

export function GamePlayView({
  topicId,
  cards,
  onComplete,
  resumeSessionId,
  progressOffset = 0,
  totalCount = cards.length,
}: GamePlayViewProps) {
  const {
    currentIndex,
    currentCard,
    isRevealed,
    isComplete,
    sessionId,
    reveal,
    grade,
  } = useGameSession({ topicId, cards, repository: gameRepository, resumeSessionId });

  const currentPosition = progressOffset + currentIndex + 1;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [noteDraft, setNoteDraft] = useState(currentCard?.notes ?? '');
  const [seededCardId, setSeededCardId] = useState(currentCard?.id);

  if (currentCard?.id !== seededCardId) {
    setSeededCardId(currentCard?.id);
    setNoteDraft(currentCard?.notes ?? '');
  }

  useEffect(() => {
    if (isComplete) onComplete(sessionId);
  }, [isComplete, sessionId, onComplete]);

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isRevealed ? 1 : 0,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [isRevealed, flipAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalCount === 0 ? 0 : (progressOffset + currentIndex) / totalCount,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressOffset, currentIndex, totalCount, progressAnim]);

  if (!currentCard) return null;

  const saveNote = () => {
    if ((currentCard.notes ?? '') === noteDraft) return;
    cardRepository.updateNotes(currentCard.id, noteDraft.trim() || null);
  };

  const handleGrade = (result: Result) => {
    saveNote();
    grade(result);
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.progress} testID="game-progress">
          Card {currentPosition} of {totalCount}
        </Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.cardStage} testID="game-card">
        <Animated.View
          style={[
            styles.card,
            styles.cardFace,
            { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
          ]}
        >
          <Text style={styles.question}>{currentCard.question}</Text>
          {!isRevealed && <Text style={styles.hint}>Tap reveal to see the answer</Text>}
        </Animated.View>

        {isRevealed && (
          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardBack,
              { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
            ]}
          >
            <View style={styles.answerBody}>
              <Text style={styles.answer} testID="game-answer">
                {currentCard.answer}
              </Text>
            </View>
            <View style={styles.notesBlock}>
              <Text style={styles.notesLabel}>Your notes</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                onBlur={saveNote}
                placeholder="Add a note for next time (optional)"
                placeholderTextColor={theme.colors.neutral[400]}
                style={styles.notesInput}
                multiline
                testID="game-notes-input"
              />
            </View>
          </Animated.View>
        )}
      </View>

      {!isRevealed ? (
        <Pressable
          onPress={reveal}
          accessibilityRole="button"
          testID="game-reveal-button"
          style={({ pressed }) => [styles.revealButton, pressed && styles.pressed]}
        >
          <Text style={styles.revealLabel}>Reveal answer</Text>
        </Pressable>
      ) : (
        <View style={styles.gradeRow}>
          <Pressable
            onPress={() => handleGrade('incorrect')}
            accessibilityRole="button"
            testID="game-grade-incorrect"
            style={({ pressed }) => [
              styles.gradeButton,
              styles.gradeIncorrect,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.gradeLabel}>Incorrect</Text>
          </Pressable>
          <Pressable
            onPress={() => handleGrade('almost')}
            accessibilityRole="button"
            testID="game-grade-almost"
            style={({ pressed }) => [
              styles.gradeButton,
              styles.gradeAlmost,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.gradeLabel}>Almost</Text>
          </Pressable>
          <Pressable
            onPress={() => handleGrade('correct')}
            accessibilityRole="button"
            testID="game-grade-correct"
            style={({ pressed }) => [
              styles.gradeButton,
              styles.gradeCorrect,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.gradeLabel}>Correct</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  progressHeader: {
    gap: theme.spacing.xs,
  },
  progress: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[400],
    textAlign: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  cardStage: {
    flex: 1,
  },
  card: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[100],
    ...theme.shadow.card,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  question: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.neutral[800],
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[300],
  },
  answerBody: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answer: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  notesBlock: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  notesLabel: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[400],
  },
  notesInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.neutral[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral[800],
    textAlignVertical: 'top',
  },
  revealButton: {
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  gradeIncorrect: {
    backgroundColor: theme.colors.warning,
  },
  gradeAlmost: {
    backgroundColor: theme.colors.secondaryAccent,
  },
  gradeCorrect: {
    backgroundColor: theme.colors.success,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  revealLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
  gradeLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
