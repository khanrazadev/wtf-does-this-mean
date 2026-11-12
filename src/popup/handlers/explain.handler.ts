
import { explainWord } from '../../services/groq.service';
import { saveVocabulary } from '../../storage/vocabulary.storage';

import type { VocabularyEntry } from '../../types/vocabulary.types';

import { escapeHtml } from '../utils/html.utils';

interface ExplainHandlerElements {
    wordInput: HTMLInputElement;
    wordForm: HTMLFormElement;
    explainButton: HTMLButtonElement;
    statusMessage: HTMLElement;
    explanationResult: HTMLDivElement;
}

function formatExplanation(entry: VocabularyEntry): string {
    return `${entry.word}

Meaning: ${entry.meaning}

Examples:
1. ${entry.examples[0]}
2. ${entry.examples[1]}`;
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

        statusMessage.textContent = '';
    });

    explanationResult.addEventListener('click', async (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
            return;
        }

        const copyButton = target.closest<HTMLButtonElement>(
            '[data-copy-explanation]',
        );

        if (!copyButton || copyButton.disabled) {
            return;
        }

        copyButton.disabled = true;

        try {
            const entryText = copyButton.dataset.copyText;

            if (!entryText) {
                throw new Error('Nothing to copy.');
            }

            await navigator.clipboard.writeText(entryText);

            copyButton.textContent = 'Copied!';
            statusMessage.textContent = 'Explanation copied to clipboard.';
        } catch {
            statusMessage.textContent = 'Could not copy the explanation.';
        } finally {
            copyButton.disabled = false;

            window.setTimeout(() => {
                copyButton.textContent = 'Copy explanation';
            }, 1500);
        }
    });

    wordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const word = wordInput.value.trim();

        if (!word || isExplaining) {
            return;
        }

        isExplaining = true;
        explainButton.disabled = true;
        explainButton.classList.add('is-loading');
        explainButton.setAttribute('aria-busy', 'true');
        explainButton.textContent = 'Finding meaning...';

        statusMessage.textContent = '';
        explanationResult.hidden = true;
        explanationResult.innerHTML = '';

        try {
            const explanation = await explainWord(word);

            const entry: VocabularyEntry = {
                ...explanation,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
            };

            let isSaved = false;

            try {
                await saveVocabulary(entry);
                isSaved = true;
            } catch {
                // Keep the explanation available even if storage fails.
            }

            const copyText = escapeHtml(formatExplanation(entry));

            explanationResult.innerHTML = `
        <article class="explanation-card">

          <div class="explanation-header">
            <div class="explanation-title-group">
              <h2 class="explanation-word">
                ${escapeHtml(entry.word)}
              </h2>

              ${entry.partOfSpeech
                    ? `<span class="word-type">${escapeHtml(entry.partOfSpeech)}</span>`
                    : ''
                }
            </div>

            <span class="save-indicator ${isSaved ? 'is-saved' : 'not-saved'}">
              ${isSaved ? '✓ Saved' : 'Not saved'}
            </span>
          </div>

          <section class="meaning-section">
            <span class="result-label">MEANING</span>

            <p class="meaning-text">
              ${escapeHtml(entry.meaning)}
            </p>
          </section>

          <section class="examples-section">
            <span class="result-label">REAL-LIFE EXAMPLES</span>

            <div class="example-item">
              <span class="example-number">01</span>
              <p>${escapeHtml(entry.examples[0])}</p>
            </div>

            <div class="example-item">
              <span class="example-number">02</span>
              <p>${escapeHtml(entry.examples[1])}</p>
            </div>
          </section>

          <button
            class="copy-button"
            type="button"
            data-copy-explanation
            data-copy-text="${copyText}"
          >
            Copy explanation
          </button>

        </article>
      `;

            explanationResult.hidden = false;

            statusMessage.textContent = isSaved
                ? 'Added to your vocabulary.'
                : 'Explanation ready, but could not save it.';
        } catch (error) {
            statusMessage.textContent =
                error instanceof Error
                    ? error.message
                    : 'Could not explain this word. Please try again.';
        } finally {
            isExplaining = false;

            explainButton.classList.remove('is-loading');
            explainButton.removeAttribute('aria-busy');

            explainButton.textContent = 'Explain word';
            explainButton.disabled = !wordInput.value.trim();
        }
    });
}
