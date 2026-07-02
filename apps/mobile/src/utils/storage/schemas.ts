/**
 * Per-table translation between raw SQLite rows (snake_case, matching
 * schema.ts exactly) and the camelCase domain shapes OnboardStore exposes.
 * `GetX` decodes a row into its domain type; `SetX` encodes a domain value
 * back into a row for writing. Field-level renames and type coercions
 * (e.g. settings.value '0'/'1' <-> boolean) are written out per schema
 * rather than derived generically, so each schema is the single source of
 * truth for both.
 */
import { z } from 'zod';

export const GetDeck = z
  .object({
    id: z.string(),
    name: z.string(),
    created_at: z.number(),
  })
  .transform((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  }));

export const SetDeck = z
  .object({
    id: z.string(),
    name: z.string(),
    createdAt: z.number(),
  })
  .transform((deck) => ({
    id: deck.id,
    name: deck.name,
    created_at: deck.createdAt,
  }));

export const GetCard = z
  .object({
    id: z.string(),
    deck_id: z.string(),
    question: z.string(),
    answer: z.string(),
    notes: z.string().nullable(),
    created_at: z.number(),
  })
  .transform((row) => ({
    id: row.id,
    deckId: row.deck_id,
    question: row.question,
    answer: row.answer,
    notes: row.notes,
    createdAt: row.created_at,
  }));

export const SetCard = z
  .object({
    id: z.string(),
    deckId: z.string(),
    question: z.string(),
    answer: z.string(),
    notes: z.string().nullable(),
    createdAt: z.number(),
  })
  .transform((card) => ({
    id: card.id,
    deck_id: card.deckId,
    question: card.question,
    answer: card.answer,
    notes: card.notes,
    created_at: card.createdAt,
  }));

export const GetSession = z
  .object({
    id: z.string(),
    deck_id: z.string(),
    started_at: z.number(),
    completed_at: z.number().nullable(),
  })
  .transform((row) => ({
    id: row.id,
    deckId: row.deck_id,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));

export const SetSession = z
  .object({
    id: z.string(),
    deckId: z.string(),
    startedAt: z.number(),
    completedAt: z.number().nullable(),
  })
  .transform((session) => ({
    id: session.id,
    deck_id: session.deckId,
    started_at: session.startedAt,
    completed_at: session.completedAt,
  }));

export const GetCardResult = z
  .object({
    session_id: z.string(),
    card_id: z.string(),
    result: z.enum(['correct', 'incorrect', 'almost']),
    answered_at: z.number(),
  })
  .transform((row) => ({
    sessionId: row.session_id,
    cardId: row.card_id,
    result: row.result,
    answeredAt: row.answered_at,
  }));

export const SetCardResult = z
  .object({
    sessionId: z.string(),
    cardId: z.string(),
    result: z.enum(['correct', 'incorrect', 'almost']),
    answeredAt: z.number(),
  })
  .transform((cardResult) => ({
    session_id: cardResult.sessionId,
    card_id: cardResult.cardId,
    result: cardResult.result,
    answered_at: cardResult.answeredAt,
  }));

const RawGetSetting = z.discriminatedUnion('key', [
  z.object({ key: z.literal('interview_mode'), value: z.enum(['0', '1']) }),
]);

// Only one variant exists today, so the transform reads its fields
// directly. Adding a second variant with a differently-typed `value` will
// stop this from type-checking, which is the point: it forces this
// transform to be rewritten per-variant at that time.
export const GetSetting = RawGetSetting.transform((row) => ({
  key: row.key,
  value: row.value === '1',
}));

const RawSetSetting = z.discriminatedUnion('key', [
  z.object({ key: z.literal('interview_mode'), value: z.boolean() }),
]);

export const SetSetting = RawSetSetting.transform((setting) => ({
  key: setting.key,
  value: setting.value ? '1' : '0',
}));

export type SettingKey = z.infer<typeof RawGetSetting>['key'];
