import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../../theme/theme';
import { CardListView } from './components/CardListView';
import { CardStatusFilter } from './components/CardStatusFilter';
import { EmptyCardsView } from './components/EmptyCardsView';
import { ManageCardsModal } from './components/ManageCardsModal';
import { TopicDetailHeader } from './components/TopicDetailHeader';
import { useTopic } from './hooks/useTopic';
import { useTopicCards } from './hooks/useTopicCards';

export interface TopicDetailScreenProps {
  topicId: string;
}

export function TopicDetailScreen({ topicId }: TopicDetailScreenProps) {
  const { topic } = useTopic(topicId);
  const {
    cardsWithStatus,
    filteredCards,
    filter,
    setFilter,
    isRefreshing,
    refresh,
    saveCardChanges,
  } = useTopicCards(topicId);
  const [isManageModalVisible, setManageModalVisible] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const openManageModal = (cardId: string | null = null) => {
    setEditingCardId(cardId);
    setManageModalVisible(true);
  };

  const handleSaveCards = async (drafts: Parameters<typeof saveCardChanges>[0]) => {
    await saveCardChanges(drafts);
    setManageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: topic?.name ?? '' }} />
      <TopicDetailHeader onManageCards={() => openManageModal()} />
      {cardsWithStatus.length === 0 ? (
        <EmptyCardsView onAddQuestions={() => openManageModal()} />
      ) : (
        <>
          <CardStatusFilter value={filter} onChange={setFilter} />
          <CardListView
            cards={filteredCards}
            onSelectCard={(card) => openManageModal(card.id)}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
          />
        </>
      )}
      <ManageCardsModal
        visible={isManageModalVisible}
        initialCards={cardsWithStatus.map(({ id, question, answer, notes }) => ({
          id,
          question,
          answer,
          notes,
        }))}
        initialEditId={editingCardId}
        onCancel={() => setManageModalVisible(false)}
        onSave={handleSaveCards}
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
