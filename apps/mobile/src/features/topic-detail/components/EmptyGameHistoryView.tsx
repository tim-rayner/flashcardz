import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export function EmptyGameHistoryView() {
  return (
    <View style={styles.container} testID="empty-game-history-view">
      <Text style={styles.icon} role="img" aria-label="Trophy">
        🏆
      </Text>
      <Text style={styles.heading}>No games played yet</Text>
      <Text style={styles.body}>Play a Game to start building your history here.</Text>
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
});
