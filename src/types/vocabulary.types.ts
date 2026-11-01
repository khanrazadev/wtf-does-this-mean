export interface VocabularyEntry {
  id: string;
  word: string;
  partOfSpeech?: string;
  meaning: string;
  examples: [string, string];
  createdAt: number;
}