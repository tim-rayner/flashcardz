import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme/theme';

export interface ResumeChoiceModalProps {
  visible: boolean;
  onResume: () => void;
  onStartOver: () => void;
  onCancel: () => void;
}

const DIALOG_SCALE_FROM = 0.92;
const ANIMATION_DURATION = 220;

export function ResumeChoiceModal({
  visible,
  onResume,
  onStartOver,
  onCancel,
}: ResumeChoiceModalProps) {
  // Kept mounted a beat longer than `visible` so the close animation can
  // play before RN's Modal tears the native view down.
  const [isMounted, setIsMounted] = useState(visible);
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

  return (
    <Modal visible={isMounted} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          testID="resume-choice-backdrop"
        />
        <Animated.View
          style={[styles.dialog, { opacity: progress, transform: [{ scale: dialogScale }] }]}
          testID="resume-choice-modal"
        >
          <Text style={styles.title}>Resume game?</Text>
          <Text style={styles.body}>
            You have a game in progress for this topic. Pick up where you left off, or start a
            fresh one.
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onStartOver}
              accessibilityRole="button"
              testID="resume-choice-start-over"
              style={styles.startOverButton}
            >
              <Text style={styles.startOverLabel}>Start over</Text>
            </Pressable>
            <Pressable
              onPress={onResume}
              accessibilityRole="button"
              testID="resume-choice-resume"
              style={styles.resumeButton}
            >
              <Text style={styles.resumeLabel}>Resume</Text>
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
    backgroundColor: 'rgba(43, 47, 39, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  dialog: {
    borderRadius: theme.radius.sheet,
    backgroundColor: theme.colors.neutral[0],
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadow.sheet,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.neutral[800],
  },
  body: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    color: theme.colors.neutral[600],
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  startOverButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    alignItems: 'center',
  },
  startOverLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[800],
  },
  resumeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  resumeLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
