import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface EmptyCardsViewProps {
  onAddQuestions: () => void;
}

export function EmptyCardsView({ onAddQuestions }: EmptyCardsViewProps) {
  return (
    <View style={styles.container} testID="empty-cards-view">
      <Text style={styles.icon} role="img" aria-label="Index card">
        🗂️
      </Text>
      <Text style={styles.heading}>No questions yet</Text>
      <Text style={styles.body}>
        Add your first question and answer to start building this topic.
      </Text>
      <Pressable
        onPress={onAddQuestions}
        accessibilityRole="button"
        accessibilityLabel="Add questions"
        testID="empty-cards-cta"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Add questions</Text>
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
    fontSize: theme.typography.h1.fontSize,
    lineHeight: theme.typography.h1.lineHeight,
    fontWeight: theme.typography.h1.fontWeight,
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
