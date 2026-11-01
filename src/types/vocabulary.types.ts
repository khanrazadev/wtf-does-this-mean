export interface VocabularyEntry {
    id: string;
    word: string;
    partOfSpeech?: string;
    meaning: string;
    examples: [string, string];
    createdAt: number;
}

export interface WordExplanation {
    word: string;
    partOfSpeech?: string;
    meaning: string;
    examples: [string, string];
}

export interface VocabularyEntry extends WordExplanation {
    id: string;
    createdAt: number;
}
