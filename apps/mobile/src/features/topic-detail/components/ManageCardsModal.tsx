import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../../../theme/theme';
import { createId } from '../../../utils/id';
import { CardDraft } from '../hooks/useTopicCards';

export interface ManageCardsModalProps {
  visible: boolean;
  initialCards: CardDraft[];
  initialEditId?: string | null;
  onCancel: () => void;
  onSave: (drafts: CardDraft[]) => void;
}

const DIALOG_SCALE_FROM = 0.92;
const ANIMATION_DURATION = 220;

interface FormState {
  editingId: string | null;
  question: string;
  answer: string;
  notes: string;
}

const EMPTY_FORM: FormState = { editingId: null, question: '', answer: '', notes: '' };

export function ManageCardsModal({
  visible,
  initialCards,
  initialEditId,
  onCancel,
  onSave,
}: ManageCardsModalProps) {
  const [drafts, setDrafts] = useState<CardDraft[]>(initialCards);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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
      setDrafts(initialCards);
      const cardToEdit = initialEditId
        ? initialCards.find((draft) => draft.id === initialEditId)
        : undefined;
      setForm(
        cardToEdit
          ? {
              editingId: cardToEdit.id,
              question: cardToEdit.question,
              answer: cardToEdit.answer,
              notes: cardToEdit.notes ?? '',
            }
          : EMPTY_FORM,
      );
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
    // initialCards/initialEditId are intentionally excluded: they should only
    // reseed drafts/form when the modal transitions to visible, not on every
    // parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, progress]);

  const canSubmitForm = form.question.trim().length > 0 && form.answer.trim().length > 0;

  const handleCancel = () => {
    onCancel();
  };

  const handleSave = () => {
    onSave(drafts);
  };

  const handleSubmitForm = () => {
    if (!canSubmitForm) return;

    const question = form.question.trim();
    const answer = form.answer.trim();
    const notes = form.notes.trim() || null;

    if (form.editingId) {
      setDrafts((current) =>
        current.map((draft) =>
          draft.id === form.editingId ? { ...draft, question, answer, notes } : draft,
        ),
      );
    } else {
      setDrafts((current) => [...current, { id: createId(), question, answer, notes }]);
    }
    setForm(EMPTY_FORM);
  };

  const handleEditRow = (draft: CardDraft) => {
    setForm({
      editingId: draft.id,
      question: draft.question,
      answer: draft.answer,
      notes: draft.notes ?? '',
    });
  };

  const handleDeleteRow = (id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
    setForm((current) => (current.editingId === id ? EMPTY_FORM : current));
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
          testID="manage-cards-backdrop"
        />
        <Animated.View
          style={[
            styles.dialog,
            { opacity: progress, transform: [{ scale: dialogScale }] },
          ]}
          testID="manage-cards-modal"
        >
          <Text style={styles.title}>Manage cards</Text>
          <View style={styles.form}>
            <TextInput
              value={form.question}
              onChangeText={(question) => setForm((current) => ({ ...current, question }))}
              placeholder="Question"
              placeholderTextColor={theme.colors.neutral[400]}
              style={styles.input}
              testID="manage-cards-question-input"
              multiline
            />
            <TextInput
              value={form.answer}
              onChangeText={(answer) => setForm((current) => ({ ...current, answer }))}
              placeholder="Answer"
              placeholderTextColor={theme.colors.neutral[400]}
              style={styles.input}
              testID="manage-cards-answer-input"
              multiline
            />
            <TextInput
              value={form.notes}
              onChangeText={(notes) => setForm((current) => ({ ...current, notes }))}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.colors.neutral[400]}
              style={styles.input}
              testID="manage-cards-notes-input"
              multiline
            />
            <Pressable
              onPress={handleSubmitForm}
              disabled={!canSubmitForm}
              testID="manage-cards-submit-form"
              style={[styles.formSubmit, !canSubmitForm && styles.formSubmitDisabled]}
            >
              <Text
                style={[
                  styles.formSubmitLabel,
                  !canSubmitForm && styles.formSubmitLabelDisabled,
                ]}
              >
                {form.editingId ? 'Update card' : 'Add card'}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.draftScroll}
            contentContainerStyle={styles.draftListContent}
            keyboardShouldPersistTaps="handled"
            testID="manage-cards-draft-list"
          >
            {drafts.map((draft) => (
              <View key={draft.id} style={styles.draftRow} testID={`manage-cards-draft-${draft.id}`}>
                <Text style={styles.draftQuestion} numberOfLines={1}>
                  {draft.question}
                </Text>
                <Pressable
                  onPress={() => handleEditRow(draft)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit card"
                  testID={`manage-cards-edit-${draft.id}`}
                  style={styles.draftAction}
                >
                  <Text style={styles.draftActionIcon}>✎</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteRow(draft.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete card"
                  testID={`manage-cards-delete-${draft.id}`}
                  style={styles.draftAction}
                >
                  <Text style={[styles.draftActionIcon, styles.draftDeleteIcon]}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              onPress={handleCancel}
              style={styles.cancelButton}
              testID="manage-cards-cancel"
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={styles.saveButton}
              testID="manage-cards-save"
            >
              <Text style={styles.saveLabel}>Save</Text>
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
    paddingVertical: theme.spacing.xl,
    backgroundColor: 'rgba(43, 47, 39, 0.4)',
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '100%',
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
  form: {
    flexShrink: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm,
  },
  formSubmit: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  formSubmitDisabled: {
    backgroundColor: theme.colors.neutral[200],
  },
  formSubmitLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
  formSubmitLabelDisabled: {
    color: theme.colors.neutral[400],
  },
  draftScroll: {
    flex: 1,
  },
  draftListContent: {
    gap: theme.spacing.xs,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  draftQuestion: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.neutral[800],
  },
  draftAction: {
    padding: theme.spacing.xs,
  },
  draftActionIcon: {
    fontSize: 16,
    color: theme.colors.neutral[600],
  },
  draftDeleteIcon: {
    color: theme.colors.warning,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
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
  saveButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.primary,
  },
  saveLabel: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    color: theme.colors.neutral[0],
  },
});
