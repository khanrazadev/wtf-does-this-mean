
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
