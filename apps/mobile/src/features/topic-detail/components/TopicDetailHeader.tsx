import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface TopicDetailHeaderProps {
  onManageCards: () => void;
  onStartGame: () => void;
  isStartGameDisabled: boolean;
  hasAbandonedGame?: boolean;
}

export function TopicDetailHeader({
  onManageCards,
  onStartGame,
  isStartGameDisabled,
  hasAbandonedGame = false,
}: TopicDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onStartGame}
        disabled={isStartGameDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isStartGameDisabled }}
        accessibilityLabel={hasAbandonedGame ? 'Resume game' : 'Start game'}
        testID={hasAbandonedGame ? 'resume-game-button' : 'start-game-button'}
        style={[styles.startGameButton, isStartGameDisabled && styles.startGameButtonDisabled]}
      >
        <Text
          style={[styles.startGameLabel, isStartGameDisabled && styles.startGameLabelDisabled]}
        >
          {hasAbandonedGame ? 'Resume game' : 'Start game'}
        </Text>
      </Pressable>
      <Pressable
        onPress={onManageCards}
        accessibilityRole="button"
        accessibilityLabel="Manage cards"
        testID="manage-cards-button"
        style={({ pressed }) => [styles.manageButton, pressed && styles.manageButtonPressed]}
      >
        <Text style={styles.manageIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const MANAGE_BUTTON_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  startGameButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameButtonDisabled: {
    backgroundColor: theme.colors.neutral[200],
  },
  startGameLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
  startGameLabelDisabled: {
    color: theme.colors.neutral[400],
  },
  manageButton: {
    width: MANAGE_BUTTON_SIZE,
    height: MANAGE_BUTTON_SIZE,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.secondaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.button,
  },
  manageButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  manageIcon: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
