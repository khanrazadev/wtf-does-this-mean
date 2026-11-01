
import './popup.css';

import {
  deleteVocabulary,
  searchVocabulary,
  saveVocabulary,
} from '../storage/vocabulary.storage';

import type { VocabularyEntry } from '../types/vocabulary.types';

// DOM element initialization

function getRequiredElement<T extends HTMLElement>(
    parent: ParentNode,
    selector: string,
): T {
    const element = parent.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Required element not found: ${selector}`);
    }

    return element;
}

const app = getRequiredElement<HTMLDivElement>(
    document,
    '#app',
);

// Popup markup

app.innerHTML = `
  <header class="header">
    <div class="brand">
      <div class="brand-icon">W</div>
      <div>
        <div class="brand-name">WTFDoesThisMean</div>
        <div class="brand-description">
          Understand words. Use them naturally.
        </div>
      </div>
    </div>
  </header>

  <nav class="tabs" aria-label="Main navigation">
    <button class="tab active" data-tab="explain" aria-selected="true">
      Explain
    </button>
    <button class="tab" data-tab="saved" aria-selected="false">
      Saved
    </button>
  </nav>

  <main class="content">
    <section id="explain-view">
      <h1 class="section-title">What's that word?</h1>
      <p class="section-description">
        Get its meaning and learn how to use it naturally.
      </p>

      <form id="word-form">
        <input
          id="word-input"
          class="word-input"
          type="text"
          placeholder="Type or paste a word or phrase..."
          autocomplete="off"
          maxlength="150"
          aria-label="Word or phrase"
          required
        />

        <button
          id="explain-button"
          class="primary-button"
          type="submit"
          disabled
        >
          Explain word
        </button>
      </form>

      <p class="hint">
        You can also select text on any webpage.
      </p>

      <p id="status-message" class="hint" role="status"></p>
    </section>

    <section id="saved-view" hidden>
      <h1 class="section-title">Your vocabulary</h1>
      <p class="section-description">
        Words and phrases you've learned.
      </p>

      <input
        id="saved-search"
        class="word-input"
        type="search"
        placeholder="Search your vocabulary..."
        aria-label="Search saved vocabulary"
      />

      <div id="saved-list" class="saved-list" aria-live="polite"></div>

      <p id="saved-status" class="hint" role="status"></p>
    </section>
  </main>

  <footer class="footer">
    A little better English, one word at a time.
  </footer>
`;

// Popup elements

const tabs = app.querySelectorAll<HTMLButtonElement>('[data-tab]');

const explainView = getRequiredElement<HTMLElement>(app, '#explain-view');
const savedView = getRequiredElement<HTMLElement>(app, '#saved-view');
const wordInput = getRequiredElement<HTMLInputElement>(app, '#word-input');
const explainButton = getRequiredElement<HTMLButtonElement>(app, '#explain-button');
const wordForm = getRequiredElement<HTMLFormElement>(app, '#word-form');
const statusMessage = getRequiredElement<HTMLElement>(app, '#status-message');
const savedSearch = getRequiredElement<HTMLInputElement>(app, '#saved-search');
const savedList = getRequiredElement<HTMLDivElement>(app, '#saved-list');
const savedStatus = getRequiredElement<HTMLElement>(app, '#saved-status');

// HTML escaping

function escapeHtml(value: string): string {
    const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };

    return value.replace(
        /[&<>"']/g,
        (character) => entities[character] ?? character,
    );
}

// Saved vocabulary rendering

function renderSavedEntries(entries: VocabularyEntry[]): void {
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

    savedList.innerHTML = entries
        .map(
            (entry) => `
        <article class="saved-entry">
          <div class="saved-entry-header">
            <div>
              <h2 class="saved-word">${escapeHtml(entry.word)}</h2>

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

          <p class="saved-meaning">${escapeHtml(entry.meaning)}</p>

          <div class="saved-examples">
            <p>${escapeHtml(entry.examples[0])}</p>
            <p>${escapeHtml(entry.examples[1])}</p>
          </div>
        </article>
      `,
        )
        .join('');
}

// Load saved vocabulary

async function loadSavedVocabulary(query = ''): Promise<void> {
    savedStatus.textContent = '';

    try {
        const entries = await searchVocabulary(query);
        renderSavedEntries(entries);
    } catch {
        savedList.innerHTML = '';
        savedStatus.textContent = 'Could not load your saved vocabulary.';
    }
}

// Tab navigation

function switchTab(tabName: 'explain' | 'saved'): void {
    const isExplainTab = tabName === 'explain';

    explainView.hidden = !isExplainTab;
    savedView.hidden = isExplainTab;

    tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === tabName;

        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });

    if (!isExplainTab) {
        void loadSavedVocabulary(savedSearch.value);
    }
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        if (tabName === 'explain' || tabName === 'saved') {
            switchTab(tabName);
        }
    });
});

// Explain form

wordInput.addEventListener('input', () => {
    explainButton.disabled = !wordInput.value.trim();
    statusMessage.textContent = '';
});

wordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const word = wordInput.value.trim();

    if (!word) {
        return;
    }

    statusMessage.textContent =
        'Word input is ready. AI integration is our next step.';
});

// Vocabulary search

savedSearch.addEventListener('input', () => {
    void loadSavedVocabulary(savedSearch.value);
});

// Delete vocabulary

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
        savedStatus.textContent = 'Could not delete this word. Try again.';
    }
});

async function addSampleVocabulary(): Promise<void> {
  const samples: VocabularyEntry[] = [
    {
      id: 'sample-1',
      word: 'Subtle',
      partOfSpeech: 'Adjective',
      meaning: 'Something not immediately obvious or noticeable.',
      examples: [
        'There was a subtle difference between the two designs.',
        'She gave him a subtle hint that she wanted to leave.',
      ],
      createdAt: Date.now(),
    },
    {
      id: 'sample-2',
      word: 'Reluctant',
      partOfSpeech: 'Adjective',
      meaning: 'Unwilling or hesitant to do something.',
      examples: [
        'He was reluctant to accept the offer.',
        'I was reluctant to ask for help.',
      ],
      createdAt: Date.now(),
    },
  ];

  await Promise.all(samples.map(saveVocabulary));
}

void addSampleVocabulary();