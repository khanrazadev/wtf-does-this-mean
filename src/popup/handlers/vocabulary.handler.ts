
import {
    deleteVocabulary,
    getVocabulary,
} from '../../storage/vocabulary.storage';

import type { VocabularyEntry } from '../../types/vocabulary.types';

import { escapeHtml } from '../utils/html.utils';

interface VocabularyHandlerElements {
    savedList: HTMLDivElement;
    savedStatus: HTMLElement;
    savedCount: HTMLElement;
}

let activePronunciationButton: HTMLButtonElement | null = null;

function getAmericanVoice(): Promise<SpeechSynthesisVoice | null> {
    const synth = window.speechSynthesis;

    const findVoice = () =>
        synth.getVoices().find(
            (voice) =>
                voice.lang.toLowerCase().replace('_', '-') === 'en-us',
        ) ?? null;

    const existingVoice = findVoice();

    if (existingVoice) {
        return Promise.resolve(existingVoice);
    }

    return new Promise((resolve) => {
        const timeout = window.setTimeout(() => {
            synth.removeEventListener('voiceschanged', handleVoicesChanged);
            resolve(findVoice());
        }, 2000);

        function handleVoicesChanged(): void {
            const voice = findVoice();

            if (voice) {
                window.clearTimeout(timeout);
                synth.removeEventListener('voiceschanged', handleVoicesChanged);
                resolve(voice);
            }
        }

        synth.addEventListener('voiceschanged', handleVoicesChanged);
    });
}

async function speakWord(
    word: string,
    button: HTMLButtonElement,
    savedStatus: HTMLElement,
): Promise<void> {
    if (!('speechSynthesis' in window)) {
        savedStatus.textContent =
            'Pronunciation is not supported by this browser.';
        return;
    }

    const synth = window.speechSynthesis;

    if (synth.speaking) {
        synth.cancel();

        if (activePronunciationButton) {
            activePronunciationButton.textContent = '🔊';
        }

        activePronunciationButton = null;
        return;
    }

    button.disabled = true;
    savedStatus.textContent = '';

    try {
        const americanVoice = await getAmericanVoice();

        if (!americanVoice) {
            savedStatus.textContent =
                'An American English voice is not available on this device.';
            return;
        }

        const utterance = new SpeechSynthesisUtterance(word);

        utterance.voice = americanVoice;
        utterance.lang = 'en-US';
        utterance.rate = 0.75;
        utterance.pitch = 1;
        utterance.volume = 1;

        activePronunciationButton = button;

        utterance.onstart = () => {
            button.textContent = '■';
            button.setAttribute(
                'aria-label',
                `Stop pronunciation of ${word}`,
            );
        };

        const resetButton = () => {
            button.textContent = '🔊';
            button.setAttribute(
                'aria-label',
                `Pronounce ${word}`,
            );

            if (activePronunciationButton === button) {
                activePronunciationButton = null;
            }
        };

        utterance.onend = resetButton;
        utterance.onerror = resetButton;

        synth.speak(utterance);
    } finally {
        button.disabled = false;
    }
}

export function initializeVocabularyHandler({
    savedList,
    savedStatus,
    savedCount,
}: VocabularyHandlerElements): void {
    async function loadSavedVocabulary(): Promise<void> {
        savedStatus.textContent = '';

        try {
            const entries = await getVocabulary();

            savedCount.textContent =
                `${entries.length} ${entries.length === 1 ? 'word' : 'words'}`;

            renderSavedEntries(entries);
        } catch {
            savedList.innerHTML = '';
            savedCount.textContent = '0 words';
            savedStatus.textContent =
                'Could not load your saved vocabulary.';
        }
    }

    function renderSavedEntries(entries: VocabularyEntry[]): void {
        if (entries.length === 0) {
            savedList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⌑</div>
                    <h2 class="empty-title">No saved words yet</h2>
                    <p class="empty-description">
                        Words you explain will appear here automatically.
                    </p>
                </div>
            `;

            return;
        }

        savedList.innerHTML = entries
            .map(
                (entry) => `
                    <article class="saved-entry">
                        <div class="saved-entry-header">
                            <div>
                                <h2 class="saved-word">
                                    ${escapeHtml(entry.word)}
                                </h2>

                                <div class="saved-word-meta">
                                    ${entry.partOfSpeech
                        ? `<span class="saved-part-of-speech">${escapeHtml(entry.partOfSpeech)}</span>`
                        : ''
                    }

                                    <button
                                        class="pronunciation-button"
                                        type="button"
                                        data-pronounce-word="${escapeHtml(entry.word)}"
                                        aria-label="Pronounce ${escapeHtml(entry.word)}"
                                        title="Listen to American pronunciation"
                                    >
                                        🔊
                                    </button>
                                </div>
                            </div>

                            <button
                                class="delete-button"
                                type="button"
                                data-delete-id="${escapeHtml(entry.id)}"
                                aria-label="Delete ${escapeHtml(entry.word)}"
                            >
                                Delete
                            </button>
                        </div>

                        <p class="saved-meaning">
                            ${escapeHtml(entry.meaning)}
                        </p>

                        <div class="saved-examples">
                            <span class="saved-examples-label">Eg</span>

                            <ul>
                                <li>${escapeHtml(entry.examples[0])}</li>
                                <li>${escapeHtml(entry.examples[1])}</li>
                            </ul>
                        </div>
                    </article>
                `,
            )
            .join('');
    }

    savedList.addEventListener('click', async (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const pronunciationButton = target.closest<HTMLButtonElement>(
            '[data-pronounce-word]',
        );

        if (pronunciationButton && !pronunciationButton.disabled) {
            const word = pronunciationButton.dataset.pronounceWord;

            if (word) {
                await speakWord(word, pronunciationButton, savedStatus);
            }

            return;
        }

        const deleteButton = target.closest<HTMLButtonElement>(
            '[data-delete-id]',
        );

        if (!deleteButton || deleteButton.disabled) {
            return;
        }

        const entryId = deleteButton.dataset.deleteId;

        if (!entryId) {
            return;
        }

        deleteButton.disabled = true;
        savedStatus.textContent = '';

        try {
            await deleteVocabulary(entryId);
            await loadSavedVocabulary();
        } catch {
            deleteButton.disabled = false;
            savedStatus.textContent =
                'Could not delete this word. Try again.';
        }
    });

    void loadSavedVocabulary();
}
