
import './popup.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
    throw new Error('Popup root element was not found.');
}

app.innerHTML = `
  <header class="header">
    <div class="brand">
      <div class="brand-icon">W</div>
      <div>
        <div class="brand-name">WTFDoesThisMean</div>
        <div class="brand-description">Understand words. Use them naturally.</div>
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

      <div class="empty-state">
        <div class="empty-icon">⌑</div>
        <h2 class="empty-title">No saved words yet</h2>
        <p class="empty-description">
          Every word you explain will automatically appear here.
        </p>
      </div>
    </section>
  </main>

  <footer class="footer">
    A little better English, one word at a time.
  </footer>
`;

const tabs = app.querySelectorAll<HTMLButtonElement>('[data-tab]');
const explainView = app.querySelector<HTMLElement>('#explain-view');
const savedView = app.querySelector<HTMLElement>('#saved-view');
const wordInput = app.querySelector<HTMLInputElement>('#word-input');
const explainButton = app.querySelector<HTMLButtonElement>('#explain-button');
const wordForm = app.querySelector<HTMLFormElement>('#word-form');
const statusMessage = app.querySelector<HTMLElement>('#status-message');

if (
    !explainView ||
    !savedView ||
    !wordInput ||
    !explainButton ||
    !wordForm ||
    !statusMessage
) {
    throw new Error('Popup elements could not be initialized.');
}

const elements = {
    explainView,
    savedView,
    wordInput,
    explainButton,
    wordForm,
    statusMessage,
};

function switchTab(tabName: 'explain' | 'saved'): void {
    const isExplainTab = tabName === 'explain';

    elements.explainView.hidden = !isExplainTab;
    elements.savedView.hidden = isExplainTab;

    tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === tabName;

        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });
}

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        if (tabName === 'explain' || tabName === 'saved') {
            switchTab(tabName);
        }
    });
});

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
