import { useTopicCardsContext } from '../../../../features/topic-detail/context/TopicCardsContext';
import { PerformanceScreen } from '../../../../features/topic-detail/PerformanceScreen';

export default function PerformanceRoute() {
  const { topicId } = useTopicCardsContext();
  return <PerformanceScreen topicId={topicId} />;
}
