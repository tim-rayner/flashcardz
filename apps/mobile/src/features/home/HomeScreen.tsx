import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { CreateTopicModal } from './components/CreateTopicModal';
import { EmptyTopicsView } from './components/EmptyTopicsView';
import { HomeHeader } from './components/HomeHeader';
import { TopicList } from './components/TopicList';
import { useTopics } from './hooks/useTopics';

export function HomeScreen() {
  const { topics, isLoading, isRefreshing, createTopic, refresh } = useTopics();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const handleSubmitTopic = async (name: string) => {
    await createTopic(name);
    setCreateModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HomeHeader onCreateTopic={() => setCreateModalVisible(true)} />
      {!isLoading &&
        (topics.length === 0 ? (
          <EmptyTopicsView onCreateTopic={() => setCreateModalVisible(true)} />
        ) : (
          <TopicList
            topics={topics}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
          />
        ))}
      <CreateTopicModal
        visible={isCreateModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleSubmitTopic}
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
