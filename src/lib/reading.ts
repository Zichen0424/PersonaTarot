import { cards, getMode } from '../data/tarot';
import type { ModeId, Orientation } from '../data/tarot';

export interface DrawnCard {
  cardId: number;
  orientation: Orientation;
}
export interface ReadingRecord {
  id: string;
  date: string;
  localDay: string;
  mode: ModeId;
  question: string;
  optionA: string;
  optionB: string;
  cards: DrawnCard[];
}
export type Phase = 'setup' | 'shuffling' | 'selecting' | 'revealing' | 'complete';
export interface ReadingState {
  mode: ModeId;
  phase: Phase;
  deck: DrawnCard[];
  selected: number[];
  revealed: number[];
  record: ReadingRecord | null;
}
export type ReadingAction =
  | { type: 'reset'; mode: ModeId; record?: ReadingRecord }
  | { type: 'shuffle'; deck: DrawnCard[] }
  | { type: 'ready' }
  | { type: 'select'; index: number }
  | { type: 'reveal'; index: number }
  | { type: 'complete'; record: ReadingRecord };

export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Uint32 / 2^32 is always in [0, 1), including the largest possible value.
export function secureRandom() {
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
}
export function shuffleDeck(random: () => number = secureRandom): DrawnCard[] {
  const deck = cards.map((card) => ({
    cardId: card.id,
    orientation: (random() < 0.5 ? 'upright' : 'reversed') as Orientation,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
export function initialState(mode: ModeId, record?: ReadingRecord): ReadingState {
  return record
    ? {
        mode,
        phase: 'complete',
        deck: record.cards,
        selected: record.cards.map((_, i) => i),
        revealed: record.cards.map((_, i) => i),
        record,
      }
    : { mode, phase: 'setup', deck: [], selected: [], revealed: [], record: null };
}
export function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  switch (action.type) {
    case 'reset':
      return initialState(action.mode, action.record);
    case 'shuffle':
      if (state.phase !== 'setup') return state;
      return {
        ...state,
        phase: 'shuffling',
        deck: action.deck,
        selected: [],
        revealed: [],
        record: null,
      };
    case 'ready':
      return state.phase === 'shuffling' ? { ...state, phase: 'selecting' } : state;
    case 'select': {
      if (
        state.phase !== 'selecting' ||
        !Number.isInteger(action.index) ||
        !state.deck[action.index] ||
        state.selected.includes(action.index)
      )
        return state;
      const selected = [...state.selected, action.index];
      return {
        ...state,
        selected,
        phase: selected.length === getMode(state.mode).positions.length ? 'revealing' : 'selecting',
      };
    }
    case 'reveal': {
      if (
        state.phase !== 'revealing' ||
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= state.selected.length ||
        state.revealed.includes(action.index)
      )
        return state;
      return { ...state, revealed: [...state.revealed, action.index] };
    }
    case 'complete': {
      if (
        state.phase !== 'revealing' ||
        state.revealed.length !== getMode(state.mode).positions.length
      )
        return state;
      return { ...state, phase: 'complete', record: action.record };
    }
  }
}
