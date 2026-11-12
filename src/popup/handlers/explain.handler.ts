
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

        if (!word || isExplaining) {
            return;
        }

        isExplaining = true;

        explainButton.disabled = true;
        explainButton.classList.add('is-loading');
        explainButton.setAttribute('aria-busy', 'true');
        explainButton.textContent = 'Explaining...';

        statusMessage.hidden = true;
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

            explanationResult.innerHTML = `
        <article class="word-card">
          <div class="word-card-header">
            <h2 class="word-card-title">
              ${escapeHtml(entry.word)}
            </h2>

            ${entry.partOfSpeech
                    ? `<span class="word-card-type">${escapeHtml(entry.partOfSpeech)}</span>`
                    : ''
                }
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

            try {
                await saveVocabulary(entry);
            } catch {
                statusMessage.textContent =
                    'Could not save this word.';
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
