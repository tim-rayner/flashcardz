import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface TopicDetailHeaderProps {
  onManageCards: () => void;
}

/**
 * The flashcard game screen doesn't exist yet, so "Start game" is rendered
 * disabled rather than wired to a placeholder route - see docs/adr/0001.
 */
export function TopicDetailHeader({ onManageCards }: TopicDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel="Start game"
        testID="start-game-button"
        style={styles.startGameButton}
      >
        <Text style={styles.startGameLabel}>Start game</Text>
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
    backgroundColor: theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  startGameLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
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
