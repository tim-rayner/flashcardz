import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../../theme/theme';

export interface CreateTopicButtonProps {
  onPress: () => void;
}

const BUTTON_SIZE = 56;

export function CreateTopicButton({ onPress }: CreateTopicButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create a new topic"
      testID="create-topic-button"
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.secondaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.button,
  },
  buttonPressed: {
    transform: [{ scale: 0.92 }],
  },
  icon: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
