import { ReactNode, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { theme } from '../../theme/theme';
import { ManageCardsModal } from './components/ManageCardsModal';
import { ResumeChoiceModal } from './components/ResumeChoiceModal';
import { TopicDetailHeader } from './components/TopicDetailHeader';
import { TopicCardsContext } from './context/TopicCardsContext';
import { useAbandonedSession } from './hooks/useAbandonedSession';
import { useTopic } from './hooks/useTopic';
import { useTopicCards } from './hooks/useTopicCards';

export interface TopicTabsLayoutProps {
  topicId: string;
  children: ReactNode;
}

export function TopicTabsLayout({ topicId, children }: TopicTabsLayoutProps) {
  const { topic } = useTopic(topicId);
  const { abandonedSessionId } = useAbandonedSession(topicId);
  const topicCards = useTopicCards(topicId);
  const [isManageModalVisible, setManageModalVisible] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isResumeChoiceVisible, setResumeChoiceVisible] = useState(false);

  const openManageModal = (cardId: string | null = null) => {
    setEditingCardId(cardId);
    setManageModalVisible(true);
  };

  const handleStartGame = () => {
    router.push(`/topics/${topicId}/game?filter=${topicCards.filter}`);
  };

  const handleHeaderButtonPress = () => {
    if (abandonedSessionId) {
      setResumeChoiceVisible(true);
      return;
    }
    handleStartGame();
  };

  const handleChooseResume = () => {
    setResumeChoiceVisible(false);
    router.push(`/topics/${topicId}/game?resume=${abandonedSessionId}`);
  };

  const handleChooseStartOver = () => {
    setResumeChoiceVisible(false);
    handleStartGame();
  };

  const handleSaveCards = async (drafts: Parameters<typeof topicCards.saveCardChanges>[0]) => {
    await topicCards.saveCardChanges(drafts);
    setManageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: topic?.name ?? '' }} />
      <TopicDetailHeader
        onManageCards={() => openManageModal()}
        onStartGame={handleHeaderButtonPress}
        isStartGameDisabled={topicCards.filteredCards.length === 0}
        hasAbandonedGame={abandonedSessionId !== null}
      />
      <TopicCardsContext.Provider value={{ ...topicCards, topicId, openManageModal }}>
        {children}
      </TopicCardsContext.Provider>
      <ManageCardsModal
        visible={isManageModalVisible}
        initialCards={topicCards.cardsWithStatus.map(({ id, question, answer, notes }) => ({
          id,
          question,
          answer,
          notes,
        }))}
        initialEditId={editingCardId}
        onCancel={() => setManageModalVisible(false)}
        onSave={handleSaveCards}
      />
      <ResumeChoiceModal
        visible={isResumeChoiceVisible}
        onResume={handleChooseResume}
        onStartOver={handleChooseStartOver}
        onCancel={() => setResumeChoiceVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
});
