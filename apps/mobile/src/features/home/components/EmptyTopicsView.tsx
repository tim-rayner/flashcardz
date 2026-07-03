import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface EmptyTopicsViewProps {
  onCreateTopic: () => void;
}

/**
 * Copy is competence-oriented rather than exclamation-heavy: it names the
 * outcome ("your first topic") and hands the user a direct action to take
 * that outcome, rather than just gesturing at the header button.
 */
export function EmptyTopicsView({ onCreateTopic }: EmptyTopicsViewProps) {
  return (
    <View style={styles.container} testID="empty-topics-view">
      <Text style={styles.icon} role="img" aria-label="Seedling">
        🌱
      </Text>
      <Text style={styles.heading}>Your first topic is one tap away</Text>
      <Text style={styles.body}>
        Pick a topic you&rsquo;re curious about, and start building the kind
        of knowledge that sticks.
      </Text>
      <Pressable
        onPress={onCreateTopic}
        accessibilityRole="button"
        accessibilityLabel="Add your first topic"
        testID="empty-topics-cta"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Add your first topic</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  heading: {
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    fontWeight: theme.typography.display.fontWeight,
    color: theme.colors.neutral[800],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.button,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaLabel: {
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
