
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

function formatExplanation(entry: VocabularyEntry): string {
    return `${entry.word}

Meaning: ${entry.meaning}

Examples:
1. ${entry.examples[0]}
2. ${entry.examples[1]}`;
}

export function initializeVocabularyHandler({
    savedSearch,
    savedList,
    savedStatus,
}: VocabularyHandlerElements): void {
    const entriesById = new Map<string, VocabularyEntry>();

    async function loadSavedVocabulary(query = ''): Promise<void> {
        savedStatus.textContent = '';

        try {
            const entries = await searchVocabulary(query);
            renderSavedEntries(entries);
        } catch {
            savedList.innerHTML = '';
            savedStatus.textContent =
                'Could not load your saved vocabulary.';
        }
    }

    function renderSavedEntries(entries: VocabularyEntry[]): void {
        entriesById.clear();

        if (entries.length === 0) {
            savedList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⌑</div>
          <h2 class="empty-title">No saved words found</h2>
          <p class="empty-description">
            Explained words will automatically appear here.
          </p>
        </div>
      `;

            return;
        }

        entries.forEach((entry) => {
            entriesById.set(entry.id, entry);
        });

        savedList.innerHTML = entries
            .map(
                (entry) => `
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

              <span class="save-indicator is-saved">
                ✓ Saved
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

            <div class="saved-actions">
              <button
                class="copy-button"
                type="button"
                data-copy-id="${escapeHtml(entry.id)}"
              >
                Copy explanation
              </button>

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

        const copyButton = target.closest<HTMLButtonElement>(
            '[data-copy-id]',
        );

        if (copyButton && !copyButton.disabled) {
            const entryId = copyButton.dataset.copyId;
            const entry = entryId ? entriesById.get(entryId) : undefined;

            if (!entry) {
                return;
            }

            copyButton.disabled = true;

            try {
                await navigator.clipboard.writeText(formatExplanation(entry));

                copyButton.textContent = 'Copied!';
                savedStatus.textContent = 'Explanation copied to clipboard.';
            } catch {
                savedStatus.textContent = 'Could not copy the explanation.';
            } finally {
                copyButton.disabled = false;

                window.setTimeout(() => {
                    copyButton.textContent = 'Copy explanation';
                }, 1500);
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
            await loadSavedVocabulary(savedSearch.value);
            savedStatus.textContent = 'Word deleted.';
        } catch {
            deleteButton.disabled = false;
            savedStatus.textContent =
                'Could not delete this word. Try again.';
        }
    });

    void loadSavedVocabulary();
}
