import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { OnboardStore } from '../../../utils/storage/onboard-store';

export interface UseAbandonedSessionResult {
  abandonedSessionId: string | null;
  refresh: () => Promise<void>;
}

export function useAbandonedSession(topicId: string): UseAbandonedSessionResult {
  const [abandonedSessionId, setAbandonedSessionId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const sessions = await OnboardStore.list('sessions', { where: { topic_id: topicId } });
    // Only the topic's most recent Game is ever resumable - an older
    // Abandoned Game left behind by a since-superseded "Start over" stays
    // in the database (its Results still count toward Card Status per
    // docs/adr/0002) but should never resurface as something to resume
    // once a more recent Game exists, whether that one is abandoned too or
    // already completed.
    const latest = sessions.sort((a, b) => b.startedAt - a.startedAt)[0];
    setAbandonedSessionId(latest && latest.completedAt === null ? latest.id : null);
  }, [topicId]);

  // Re-checks every time Topic Detail regains focus (e.g. backing out of a
  // Game), not just on first mount - the screen stays mounted underneath
  // the Game route in the stack, so a mount-only effect would never see a
  // session abandoned after the initial visit.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { abandonedSessionId, refresh };
}
