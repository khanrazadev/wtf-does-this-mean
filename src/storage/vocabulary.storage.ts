import type { VocabularyEntry } from '../types/vocabulary.types';

const STORAGE_KEY = 'vocabulary';

export async function getVocabulary(): Promise<VocabularyEntry[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const entries: unknown = result[STORAGE_KEY];

  return Array.isArray(entries)
    ? (entries as VocabularyEntry[])
    : [];
}

export async function saveVocabulary(
  entry: VocabularyEntry,
): Promise<void> {
  const entries = await getVocabulary();

  const normalizedWord = entry.word.trim().toLowerCase();

  const alreadySaved = entries.some(
    (savedEntry) =>
      savedEntry.word.trim().toLowerCase() === normalizedWord,
  );

  if (alreadySaved) {
    return;
  }

  await chrome.storage.local.set({
    [STORAGE_KEY]: [entry, ...entries],
  });
}

export async function deleteVocabulary(id: string): Promise<void> {
  const entries = await getVocabulary();

  const updatedEntries = entries.filter(
    (entry) => entry.id !== id,
  );

  await chrome.storage.local.set({
    [STORAGE_KEY]: updatedEntries,
  });
}

export async function searchVocabulary(
  query: string,
): Promise<VocabularyEntry[]> {
  const entries = await getVocabulary();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return entries;
  }

  return entries.filter((entry) =>
    entry.word.toLowerCase().includes(normalizedQuery),
  );
}