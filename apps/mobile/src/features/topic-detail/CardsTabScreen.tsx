import { StyleSheet, View } from 'react-native';
import { theme } from '../../theme/theme';
import { CardListView } from './components/CardListView';
import { CardStatusFilter } from './components/CardStatusFilter';
import { EmptyCardsView } from './components/EmptyCardsView';
import { useTopicCardsContext } from './context/TopicCardsContext';

export function CardsTabScreen() {
  const {
    cardsWithStatus,
    filteredCards,
    filter,
    setFilter,
    isRefreshing,
    refresh,
    openManageModal,
  } = useTopicCardsContext();

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
});
