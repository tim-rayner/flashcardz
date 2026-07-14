import { useLocalSearchParams } from 'expo-router';
import { TopicDetailScreen } from '../../features/topic-detail/TopicDetailScreen';

export default function TopicDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TopicDetailScreen topicId={id} />;
}
