import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../../../theme/theme';
import { Topic } from '../../../utils/storage/onboard-store';

export interface TopicCardProps {
  topic: Topic;
  onPress?: (topic: Topic) => void;
  size: number;
}

export function TopicCard({ topic, onPress, size }: TopicCardProps) {
  const sizeStyle: StyleProp<ViewStyle> = { width: size, height: size };

  return (
    <Pressable
      onPress={() => onPress?.(topic)}
      accessibilityRole="button"
      testID={`topic-card-${topic.id}`}
      style={({ pressed }) => [styles.card, sizeStyle, pressed && styles.cardPressed]}
    >
      <Text style={styles.name} numberOfLines={2}>
        {topic.name}
      </Text>
      <Text style={styles.cta}>Tap to study</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    ...theme.shadow.card,
  },
  cardPressed: {
    opacity: 0.85,
  },
  name: {
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.typography.title.fontWeight,
    color: theme.colors.neutral[800],
  },
  cta: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.primary,
  },
});
