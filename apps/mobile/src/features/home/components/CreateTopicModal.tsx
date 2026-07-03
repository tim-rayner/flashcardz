import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../../../theme/theme';

export interface CreateTopicModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

const DIALOG_SCALE_FROM = 0.92;
const ANIMATION_DURATION = 220;

export function CreateTopicModal({
  visible,
  onCancel,
  onSubmit,
}: CreateTopicModalProps) {
  const [name, setName] = useState('');
  // Kept mounted a beat longer than `visible` so the close animation can
  // play before RN's Modal tears the native view down.
  const [isMounted, setIsMounted] = useState(visible);
  // Single driver for backdrop fade, dialog fade, and dialog scale keeps the
  // entrance/exit reading as one motion instead of three loosely-synced ones.
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dialogScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [DIALOG_SCALE_FROM, 1],
  });

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
  }, [visible, progress]);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(name.trim());
    setName('');
  };

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          testID="create-topic-backdrop"
        />
        <Animated.View
          style={[
            styles.dialog,
            { opacity: progress, transform: [{ scale: dialogScale }] },
          ]}
          testID="create-topic-modal"
        >
          <Text style={styles.title}>Name your topic</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. SOLID Principles"
            placeholderTextColor={theme.colors.neutral[400]}
            style={styles.input}
            autoFocus
            testID="create-topic-input"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <View style={styles.actions}>
            <Pressable
              onPress={handleCancel}
              style={styles.cancelButton}
              testID="create-topic-cancel"
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              testID="create-topic-submit"
            >
              <Text
                style={[
                  styles.submitLabel,
                  !canSubmit && styles.submitLabelDisabled,
                ]}
              >
                Create topic
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(43, 47, 39, 0.4)',
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.neutral[0],
    borderRadius: theme.radius.sheet,
    padding: theme.spacing.lg,
    ...theme.shadow.sheet,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.card,
  },
  cancelLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[600],
  },
  submitButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.neutral[200],
  },
  submitLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
  submitLabelDisabled: {
    color: theme.colors.neutral[400],
  },
});
