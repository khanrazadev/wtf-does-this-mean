
import { explainWord } from '../../services/groq.service';
import {
    getVocabulary,
    saveVocabulary,
} from '../../storage/vocabulary.storage';
import type { VocabularyEntry } from '../../types/vocabulary.types';
import { escapeHtml } from '../utils/html.utils';

interface ExplainHandlerElements {
    wordInput: HTMLInputElement;
    wordForm: HTMLFormElement;
    explainButton: HTMLButtonElement;
    statusMessage: HTMLElement;
    explanationResult: HTMLDivElement;
}

function isSingleWord(value: string): boolean {
    const wordPattern =
        /^[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*$/u;

    return wordPattern.test(value.trim());
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
    statusMessage: HTMLElement,
): Promise<void> {
    if (!('speechSynthesis' in window)) {
        statusMessage.textContent =
            'Pronunciation is not supported by this browser.';
        statusMessage.hidden = false;
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
    statusMessage.hidden = true;

    try {
        const americanVoice = await getAmericanVoice();

        if (!americanVoice) {
            statusMessage.textContent =
                'An American English voice is not available on this device.';
            statusMessage.hidden = false;
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
            button.setAttribute('aria-label', `Stop pronunciation of ${word}`);
        };

        const resetButton = () => {
            button.textContent = '🔊';
            button.setAttribute('aria-label', `Pronounce ${word}`);

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

export function initializeExplainHandler({
    wordInput,
    wordForm,
    explainButton,
    statusMessage,
    explanationResult,
}: ExplainHandlerElements): void {
    let isExplaining = false;

    wordInput.addEventListener('input', () => {
        explainButton.disabled =
            isExplaining || !wordInput.value.trim();

        statusMessage.hidden = true;
        statusMessage.textContent = '';
    });

    wordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const word = wordInput.value.trim();

        if (!word || isExplaining) return;

        if (!isSingleWord(word)) {
            statusMessage.textContent =
                'Please enter one word at a time. This tool is designed for vocabulary explanations, not general questions.';
            statusMessage.hidden = false;
            explanationResult.hidden = true;
            return;
        }

        isExplaining = true;
        explainButton.disabled = true;
        explainButton.classList.add('is-loading');
        explainButton.setAttribute('aria-busy', 'true');
        explainButton.textContent = 'Checking...';

        statusMessage.hidden = true;
        statusMessage.textContent = '';
        explanationResult.hidden = true;
        explanationResult.innerHTML = '';

        try {
            const existingEntries = await getVocabulary();

            const normalizedWord = word.toLocaleLowerCase();

            const alreadySaved = existingEntries.some(
                (entry) =>
                    entry.word.trim().toLocaleLowerCase() === normalizedWord,
            );

            if (alreadySaved) {
                statusMessage.textContent =
                    "You've already learned this word. Find it in Saved vocabulary.";
                statusMessage.hidden = false;
                return;
            }

            explainButton.textContent = 'Explaining...';

            const explanation = await explainWord(word);

            const entry: VocabularyEntry = {
                ...explanation,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
            };

            explanationResult.innerHTML = `
        <article class="word-card">
          <div class="word-card-header">
            <h2 class="word-card-title">${escapeHtml(entry.word)}</h2>

            ${entry.partOfSpeech
                    ? `<span class="word-card-type">${escapeHtml(entry.partOfSpeech)}</span>`
                    : ''
                }

            <button
              class="pronunciation-button"
              type="button"
              aria-label="Pronounce ${escapeHtml(entry.word)}"
              title="Listen to American pronunciation"
            >
              🔊
            </button>
          </div>

          <p class="word-card-meaning">
            ${escapeHtml(entry.meaning)}
          </p>

          <div class="word-card-examples">
            <span class="examples-label">Eg</span>
            <ul>
              <li>${escapeHtml(entry.examples[0])}</li>
              <li>${escapeHtml(entry.examples[1])}</li>
            </ul>
          </div>
        </article>
      `;

            explanationResult.hidden = false;

            const pronunciationButton =
                explanationResult.querySelector<HTMLButtonElement>(
                    '.pronunciation-button',
                );

            pronunciationButton?.addEventListener('click', () => {
                speakWord(entry.word, pronunciationButton, statusMessage);
            });

            try {
                await saveVocabulary(entry);
            } catch {
                statusMessage.textContent = 'Could not save this word.';
                statusMessage.hidden = false;
            }
        } catch (error) {
            statusMessage.textContent =
                error instanceof Error
                    ? error.message
                    : 'Could not explain this word. Please try again.';

            statusMessage.hidden = false;
        } finally {
            isExplaining = false;
            explainButton.classList.remove('is-loading');
            explainButton.removeAttribute('aria-busy');
            explainButton.textContent = 'Explain';
            explainButton.disabled = !wordInput.value.trim();
        }
    });
}
