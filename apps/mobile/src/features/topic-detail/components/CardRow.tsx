import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../../theme/theme';
import { CardWithStatus } from '../hooks/useTopicCards';
import { CardStatusBadge } from './CardStatusBadge';

export interface CardRowProps {
  card: CardWithStatus;
  onPress: (card: CardWithStatus) => void;
}

export function CardRow({ card, onPress }: CardRowProps) {
  return (
    <Pressable
      onPress={() => onPress(card)}
      accessibilityRole="button"
      testID={`card-row-${card.id}`}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Text style={styles.question} numberOfLines={2}>
        {card.question}
      </Text>
      <CardStatusBadge status={card.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadow.card,
  },
  rowPressed: {
    opacity: 0.85,
  },
  question: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.bodyEmph.fontWeight,
    color: theme.colors.neutral[800],
  },
});
