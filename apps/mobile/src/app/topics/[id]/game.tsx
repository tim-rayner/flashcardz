import { useLocalSearchParams } from 'expo-router';
import { GameScreen } from '../../../features/game/GameScreen';
import { isCardStatusFilter } from '../../../features/topic-detail/utils/cardStatus';

export default function GameRoute() {
  const { id, filter, resume } = useLocalSearchParams<{
    id: string;
    filter?: string;
    resume?: string;
  }>();
  return (
    <GameScreen
      topicId={id}
      filter={isCardStatusFilter(filter) ? filter : 'all'}
      resumeSessionId={resume}
    />
  );
}
