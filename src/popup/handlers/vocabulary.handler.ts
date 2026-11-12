
import {
    deleteVocabulary,
    searchVocabulary,
} from '../../storage/vocabulary.storage';

import type { VocabularyEntry } from '../../types/vocabulary.types';

import { escapeHtml } from '../utils/html.utils';

interface VocabularyHandlerElements {
    savedSearch: HTMLInputElement;
    savedList: HTMLDivElement;
    savedStatus: HTMLElement;
}

export function initializeVocabularyHandler({
    savedSearch,
    savedList,
    savedStatus,
}: VocabularyHandlerElements): void {
    let searchRequestId = 0;

    async function loadSavedVocabulary(query = ''): Promise<void> {
        const requestId = ++searchRequestId;

        savedStatus.textContent = '';

        try {
            const entries = await searchVocabulary(query);

            // Ignore outdated search results.
            if (requestId !== searchRequestId) {
                return;
            }

            renderSavedEntries(entries);
        } catch {
            if (requestId !== searchRequestId) {
                return;
            }

            savedList.innerHTML = '';
            savedStatus.textContent =
                'Could not load your saved vocabulary.';
        }
    }

    function renderSavedEntries(entries: VocabularyEntry[]): void {
        if (entries.length === 0) {
            savedList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⌑</div>
          <h2 class="empty-title">No saved words found</h2>
          <p class="empty-description">
            Your saved vocabulary will appear here.
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

                ${entry.partOfSpeech
                        ? `<span class="saved-part-of-speech">${escapeHtml(entry.partOfSpeech)}</span>`
                        : ''
                    }
              </div>

              <button
                class="delete-button"
                type="button"
                data-delete-id="${escapeHtml(entry.id)}"
                aria-label="Delete ${escapeHtml(entry.word)}"
                title="Delete word"
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

    savedSearch.addEventListener('input', () => {
        void loadSavedVocabulary(savedSearch.value);
    });

    savedList.addEventListener('click', async (event) => {
        const target = event.target;

        if (!(target instanceof Element)) {
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
            await loadSavedVocabulary(savedSearch.value);
        } catch {
            deleteButton.disabled = false;
            savedStatus.textContent =
                'Could not delete this word. Try again.';
        }
    });

    void loadSavedVocabulary();
}
