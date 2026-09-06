import { describe, expect, it } from 'vitest';
import { cards, getMode, getPositionLabels, modes } from '../data/tarot';
import { initialState, localDay, readingReducer, shuffleDeck } from './reading';
import type { ReadingRecord } from './reading';
import { addRecord, dailyFor, loadSaved, saveData, validRecord } from './storage';
import type { SavedData, StorageLike } from './storage';

const record = (overrides: Partial<ReadingRecord> = {}): ReadingRecord => ({
  id: 'test-record',
  date: '2026-09-06T04:30:00.000Z',
  localDay: '2026-09-06',
  mode: 'daily',
  question: '今天值得关注什么？',
  optionA: '',
  optionB: '',
  cards: [{ cardId: 17, orientation: 'upright' }],
  ...overrides,
});
const empty = (): SavedData => ({ version: 1, history: [], daily: null });

describe('complete tarot content', () => {
  it('covers all 22 cards and all mode/orientation combinations', () => {
    expect(cards.map((c) => c.id)).toEqual(Array.from({ length: 22 }, (_, i) => i));
    for (const card of cards)
      for (const direction of ['upright', 'reversed'] as const) {
        expect(card[direction].keywords.length).toBeGreaterThanOrEqual(3);
        expect(card[direction].meaning.length).toBeGreaterThan(15);
        expect(card[direction].advice.length).toBeGreaterThan(10);
        for (const mode of modes)
          expect(card[direction].readings[mode.id].length).toBeGreaterThan(15);
        expect(new Set(Object.values(card[direction].readings)).size).toBe(4);
      }
  });
  it('uses the expected card counts and branch names', () => {
    expect(modes.map((m) => m.positions.length)).toEqual([1, 3, 3, 5]);
    expect(getPositionLabels('crossroads', ' 留下 ', '出发')).toEqual([
      '当前处境',
      '留下的助力',
      '留下的挑战',
      '出发的助力',
      '出发的挑战',
    ]);
    expect(getPositionLabels('crossroads', ' ', '')).toEqual(getMode('crossroads').positions);
  });
});

describe('random deck', () => {
  it('always has 22 distinct valid cards', () => {
    for (let n = 0; n < 100; n++) {
      const deck = shuffleDeck();
      expect(deck).toHaveLength(22);
      expect(new Set(deck.map((c) => c.cardId)).size).toBe(22);
      expect(deck.every((c) => c.orientation === 'upright' || c.orientation === 'reversed')).toBe(
        true,
      );
    }
  });
  it('has an exact 0.5 orientation threshold with no undefined shuffle positions', () => {
    expect(shuffleDeck(() => 0).every((c) => c.orientation === 'upright')).toBe(true);
    expect(shuffleDeck(() => 0.49999).every((c) => c.orientation === 'upright')).toBe(true);
    expect(shuffleDeck(() => 0.5).every((c) => c.orientation === 'reversed')).toBe(true);
    expect(shuffleDeck(() => 0.999999).map((c) => c.cardId)).toEqual(cards.map((c) => c.id));
  });
});

describe('reading state transitions', () => {
  for (const mode of modes)
    it(`${mode.id}: only completes after enough unique picks and reveals`, () => {
      let state = initialState(mode.id);
      expect(readingReducer(state, { type: 'select', index: 0 })).toBe(state);
      state = readingReducer(state, { type: 'shuffle', deck: shuffleDeck(() => 0.25) });
      expect(state.phase).toBe('shuffling');
      expect(readingReducer(state, { type: 'shuffle', deck: shuffleDeck() })).toBe(state);
      expect(readingReducer(state, { type: 'select', index: 0 })).toBe(state);
      state = readingReducer(state, { type: 'ready' });
      expect(readingReducer(state, { type: 'select', index: 22 })).toBe(state);
      expect(readingReducer(state, { type: 'select', index: -1 })).toBe(state);
      expect(readingReducer(state, { type: 'select', index: 0.1 })).toBe(state);
      for (let i = 0; i < mode.positions.length; i++) {
        state = readingReducer(state, { type: 'select', index: i });
        expect(readingReducer(state, { type: 'select', index: i })).toBe(state);
      }
      expect(state.phase).toBe('revealing');
      expect(readingReducer(state, { type: 'select', index: 21 })).toBe(state);
      expect(readingReducer(state, { type: 'complete', record: record() })).toBe(state);
      expect(readingReducer(state, { type: 'reveal', index: 99 })).toBe(state);
      for (let i = mode.positions.length - 1; i >= 0; i--) {
        state = readingReducer(state, { type: 'reveal', index: i });
        expect(readingReducer(state, { type: 'reveal', index: i })).toBe(state);
      }
      const completed = record({ mode: mode.id, cards: state.selected.map((i) => state.deck[i]) });
      state = readingReducer(state, { type: 'complete', record: completed });
      expect(state.phase).toBe('complete');
      expect(state.record).toBe(completed);
      expect(readingReducer(state, { type: 'complete', record: completed })).toBe(state);
      expect(initialState(mode.id, completed).record).toEqual(completed);
    });
  it('resets an unfinished reading and ignores late shuffle callbacks', () => {
    let state = readingReducer(initialState('timeline'), { type: 'shuffle', deck: shuffleDeck() });
    state = readingReducer(state, { type: 'reset', mode: 'crossroads' });
    expect(state).toEqual(initialState('crossroads'));
    expect(readingReducer(state, { type: 'ready' })).toBe(state);
  });
});

describe('daily and local history', () => {
  it('uses local calendar dates, including the midnight boundary', () => {
    expect(localDay(new Date(2026, 8, 6, 23, 59, 59))).toBe('2026-09-06');
    expect(localDay(new Date(2026, 8, 7, 0, 0, 0))).toBe('2026-09-07');
  });
  it('restores the same daily result only on its local date', () => {
    const saved = addRecord(empty(), record());
    expect(dailyFor(saved, '2026-09-06')).toEqual(record());
    expect(dailyFor(saved, '2026-09-07')).toBeUndefined();
    expect(dailyFor({ ...saved, history: [] }, '2026-09-06')).toEqual(record());
  });
  it('deduplicates completion and caps history while retaining daily', () => {
    let saved = addRecord(empty(), record());
    expect(addRecord(saved, record())).toBe(saved);
    for (let i = 0; i < 35; i++)
      saved = addRecord(
        saved,
        record({
          id: 'later-' + i,
          mode: 'timeline',
          cards: [
            { cardId: 1, orientation: 'upright' },
            { cardId: 9, orientation: 'reversed' },
            { cardId: 21, orientation: 'upright' },
          ],
        }),
      );
    expect(saved.history).toHaveLength(30);
    expect(saved.history[0].id).toBe('later-34');
    expect(saved.daily).toEqual(record());
  });
  it('round-trips a result with custom options and both orientations', () => {
    let raw: string | null = null;
    const storage: StorageLike = {
      getItem: () => raw,
      setItem: (_, value) => {
        raw = value;
      },
    };
    const saved = addRecord(
      empty(),
      record({
        mode: 'crossroads',
        optionA: '留下',
        optionB: '出发',
        cards: [0, 1, 2, 3, 4].map((cardId, i) => ({
          cardId,
          orientation: i % 2 ? 'reversed' : 'upright',
        })),
      }),
    );
    expect(saveData(storage, saved)).toBe(true);
    expect(loadSaved(storage).data).toEqual(saved);
  });
  it('safely falls back for corrupt, incompatible, or inaccessible storage', () => {
    for (const raw of [
      '{broken',
      'null',
      '42',
      '{"version":9}',
      JSON.stringify({
        version: 1,
        history: [record({ cards: [{ cardId: 99, orientation: 'upright' }] })],
        daily: {},
      }),
    ]) {
      expect(loadSaved({ getItem: () => raw, setItem: () => {} }).data).toEqual(empty());
    }
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(loadSaved(blocked).available).toBe(false);
    expect(saveData(blocked, empty())).toBe(false);
    expect(saveData(null, empty())).toBe(false);
  });
  it('filters invalid records and does not accept duplicate cards or unknown modes', () => {
    expect(validRecord(record())).toBe(true);
    expect(validRecord(record({ date: 'invalid' }))).toBe(false);
    expect(validRecord({ ...record(), mode: 'unknown' })).toBe(false);
    expect(
      validRecord(
        record({
          mode: 'timeline',
          cards: [0, 0, 1].map((cardId) => ({ cardId, orientation: 'upright' })),
        }),
      ),
    ).toBe(false);
    expect(validRecord(record({ question: 'x'.repeat(201) }))).toBe(false);
    const raw = JSON.stringify({
      version: 1,
      history: [record(), record(), null, {}],
      daily: record(),
    });
    expect(loadSaved({ getItem: () => raw, setItem: () => {} }).data.history).toHaveLength(1);
  });
});
