import { cards, allModes, getMode, isDailyMode } from '../data/tarot';
import type { ReadingRecord } from './reading';

export const STORAGE_KEY = 'blue-hour:v1';
export interface SavedData {
  version: 1;
  history: ReadingRecord[];
  daily: ReadingRecord | null;
}
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const emptyData = (): SavedData => ({ version: 1, history: [], daily: null });

export function validRecord(value: unknown): value is ReadingRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as ReadingRecord;
  if (
    typeof r.id !== 'string' ||
    r.id.length > 100 ||
    !r.id ||
    typeof r.date !== 'string' ||
    Number.isNaN(Date.parse(r.date))
  )
    return false;
  if (
    typeof r.localDay !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(r.localDay) ||
    !allModes.some((m) => m.id === r.mode)
  )
    return false;
  if (
    typeof r.question !== 'string' ||
    r.question.length > 200 ||
    typeof r.optionA !== 'string' ||
    r.optionA.length > 24 ||
    typeof r.optionB !== 'string' ||
    r.optionB.length > 24
  )
    return false;
  if (!Array.isArray(r.cards) || r.cards.length !== getMode(r.mode).positions.length) return false;
  if (
    !r.cards.every(
      (c) =>
        c &&
        Number.isInteger(c.cardId) &&
        cards.some((card) => card.id === c.cardId) &&
        (c.orientation === 'upright' || c.orientation === 'reversed'),
    )
  )
    return false;
  return new Set(r.cards.map((c) => c.cardId)).size === r.cards.length;
}
export function loadSaved(storage: StorageLike | null): { data: SavedData; available: boolean } {
  try {
    if (!storage) return { data: emptyData(), available: false };
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyData(), available: true };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || (parsed as SavedData).version !== 1)
      return { data: emptyData(), available: true };
    const saved = parsed as SavedData;
    const seen = new Set<string>();
    const history = Array.isArray(saved.history)
      ? saved.history
          .filter(validRecord)
          .filter((record) => {
            if (seen.has(record.id)) return false;
            seen.add(record.id);
            return true;
          })
          .slice(0, 30)
      : [];
    const daily = validRecord(saved.daily) && isDailyMode(saved.daily.mode) ? saved.daily : null;
    return { data: { version: 1, history, daily }, available: true };
  } catch (error) {
    return { data: emptyData(), available: error instanceof SyntaxError };
  }
}
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
export function saveData(storage: StorageLike | null, data: SavedData) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function addRecord(data: SavedData, record: ReadingRecord): SavedData {
  if (data.history.some((item) => item.id === record.id)) return data;
  return {
    version: 1,
    history: [record, ...data.history].slice(0, 30),
    daily: isDailyMode(record.mode) ? record : data.daily,
  };
}
export function dailyFor(data: SavedData, day: string) {
  return data.daily?.localDay === day ? data.daily : undefined;
}
