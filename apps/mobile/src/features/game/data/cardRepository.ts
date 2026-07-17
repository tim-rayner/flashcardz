import { OnboardStore } from '../../../utils/storage/onboard-store';

export const cardRepository = {
  async updateNotes(cardId: string, notes: string | null): Promise<void> {
    const card = await OnboardStore.get('cards', { id: cardId });
    if (!card) return;
    await OnboardStore.set('cards', { ...card, notes });
  },
};
