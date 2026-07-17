import { GameRepository } from '@org/game-engine';
import { OnboardStore } from '../../../utils/storage/onboard-store';

export const gameRepository: GameRepository = {
  async createSession(session) {
    await OnboardStore.set('sessions', session);
  },

  async recordResult(result) {
    await OnboardStore.set('card_results', result);
  },

  async completeSession(sessionId, completedAt) {
    const session = await OnboardStore.get('sessions', { id: sessionId });
    if (!session) return;
    await OnboardStore.set('sessions', { ...session, completedAt });
  },

  async listResultsForSession(sessionId) {
    return OnboardStore.list('card_results', {
      where: { session_id: sessionId },
    });
  },
};
