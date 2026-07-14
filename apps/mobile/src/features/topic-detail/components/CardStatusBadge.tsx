import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';
import { CardStatus } from '../utils/cardStatus';

export interface CardStatusBadgeProps {
  status: CardStatus;
}

const STATUS_LABEL: Record<CardStatus, string> = {
  never: 'Never answered',
  correct: 'Correct',
  incorrect: 'Incorrect',
  almost: 'Almost',
};

const STATUS_COLOR: Record<CardStatus, string> = {
  never: theme.colors.neutral[400],
  correct: theme.colors.success,
  incorrect: theme.colors.warning,
  almost: theme.colors.secondaryAccent,
};

export function CardStatusBadge({ status }: CardStatusBadgeProps) {
  const color = STATUS_COLOR[status];

  return (
    <View
      style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }]}
      testID={`card-status-badge-${status}`}
    >
      <Text style={[styles.label, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
  },
});
