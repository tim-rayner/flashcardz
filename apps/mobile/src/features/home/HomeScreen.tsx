import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../theme/theme';
import { CreateTopicModal } from './components/CreateTopicModal';
import { EmptyTopicsView } from './components/EmptyTopicsView';
import { HomeHeader } from './components/HomeHeader';
import { TopicList } from './components/TopicList';
import { useTopics } from './hooks/useTopics';
import { Topic } from '../../utils/storage/onboard-store';

export function HomeScreen() {
  const { topics, isLoading, isRefreshing, createTopic, refresh } = useTopics();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const handleSubmitTopic = async (name: string) => {
    await createTopic(name);
    setCreateModalVisible(false);
  };

  const handleSelectTopic = (topic: Topic) => {
    router.push(`/topics/${topic.id}`);
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
            onSelectTopic={handleSelectTopic}
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
