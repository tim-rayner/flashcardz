import { useLocalSearchParams } from 'expo-router';
import { GameSummaryScreen } from '../../../../features/game/GameSummaryScreen';
import { isCardStatusFilter } from '../../../../features/topic-detail/utils/cardStatus';

export default function GameSummaryRoute() {
  const { id, sessionId, filter } = useLocalSearchParams<{
    id: string;
    sessionId: string;
    filter?: string;
  }>();
  return (
    <GameSummaryScreen
      topicId={id}
      sessionId={sessionId}
      filter={isCardStatusFilter(filter) ? filter : 'all'}
    />
  );
}
