
export const popupMarkup = `
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
    <button
      class="tab active"
      data-tab="explain"
      aria-selected="true"
      type="button"
    >
      Explain
    </button>

    <button
      class="tab"
      data-tab="saved"
      aria-selected="false"
      type="button"
    >
      Saved
    </button>
  </nav>

  <main class="content">
    <section id="explain-view">
      <div class="explain-main">
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
            Explain
          </button>
        </form>

        <p id="status-message" class="hint" role="status" hidden></p>

        <div
          id="explanation-result"
          aria-live="polite"
          hidden
        ></div>
      </div>

      <details class="settings-panel">
        <summary>Groq API settings</summary>

        <form id="api-key-form">
          <input
            id="api-key-input"
            class="word-input"
            type="password"
            placeholder="Paste your Groq API key"
            autocomplete="off"
            required
          />

          <button
            id="save-api-key"
            class="primary-button"
            type="submit"
          >
            Save API key
          </button>
        </form>

        <button
          id="remove-api-key"
          class="delete-button"
          type="button"
          hidden
        >
          Remove API key
        </button>

        <p id="api-key-status" class="hint" role="status"></p>
      </details>
    </section>

    <section id="saved-view" hidden>
      <input
        id="saved-search"
        class="word-input"
        type="search"
        placeholder="Search your vocabulary..."
        aria-label="Search saved vocabulary"
      />

      <div
        id="saved-list"
        class="saved-list"
        aria-live="polite"
      ></div>

      <p id="saved-status" class="hint" role="status"></p>
    </section>
  </main>
`;
