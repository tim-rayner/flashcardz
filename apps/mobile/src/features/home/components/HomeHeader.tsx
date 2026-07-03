import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';
import { CreateTopicButton } from './CreateTopicButton';

export interface HomeHeaderProps {
  onCreateTopic: () => void;
}

export function HomeHeader({ onCreateTopic }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Topics</Text>
      <CreateTopicButton onPress={onCreateTopic} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    lineHeight: theme.typography.h1.lineHeight,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.neutral[800],
  },
});
