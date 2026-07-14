import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { theme } from '../../../theme/theme';
import { CARD_STATUS_FILTERS, CARD_STATUS_LABELS, CardStatusFilter as Filter } from '../utils/cardStatus';

export interface CardStatusFilterProps {
  value: Filter;
  onChange: (filter: Filter) => void;
}

export function CardStatusFilter({ value, onChange }: CardStatusFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      testID="card-status-filter"
    >
      {CARD_STATUS_FILTERS.map((filter) => {
        const isActive = filter === value;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            testID={`card-status-filter-chip-${filter}`}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {CARD_STATUS_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm + theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.neutral[0],
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.colors.neutral[600],
  },
  labelActive: {
    color: theme.colors.neutral[0],
    fontWeight: '600',
  },
});
