
import './popup.css';

import { popupMarkup } from './components/popup-view';
import { initializeExplainHandler } from './handlers/explain.handler';
import { initializeVocabularyHandler } from './handlers/vocabulary.handler';
import { initializeSettingsHandler } from './handlers/settings.handler';
import { getRequiredElement } from './utils/dom.utils';

const app = getRequiredElement<HTMLDivElement>(
  document,
  '#app',
);

app.innerHTML = popupMarkup;

// Explain elements
const wordInput = getRequiredElement<HTMLInputElement>(
  app,
  '#word-input',
);

const wordForm = getRequiredElement<HTMLFormElement>(
  app,
  '#word-form',
);

const explainButton = getRequiredElement<HTMLButtonElement>(
  app,
  '#explain-button',
);

const statusMessage = getRequiredElement<HTMLElement>(
  app,
  '#status-message',
);

const explanationResult = getRequiredElement<HTMLDivElement>(
  app,
  '#explanation-result',
);

// Saved vocabulary elements
const savedList = getRequiredElement<HTMLDivElement>(
  app,
  '#saved-list',
);

const savedStatus = getRequiredElement<HTMLElement>(
  app,
  '#saved-status',
);

const savedCount = getRequiredElement<HTMLElement>(
  app,
  '#saved-count',
);

// Settings elements
const apiKeyForm = getRequiredElement<HTMLFormElement>(
  app,
  '#api-key-form',
);

const apiKeyInput = getRequiredElement<HTMLInputElement>(
  app,
  '#api-key-input',
);

const saveApiKeyButton = getRequiredElement<HTMLButtonElement>(
  app,
  '#save-api-key',
);

const removeApiKeyButton = getRequiredElement<HTMLButtonElement>(
  app,
  '#remove-api-key',
);

const apiKeyStatus = getRequiredElement<HTMLElement>(
  app,
  '#api-key-status',
);

// Initialize handlers
initializeExplainHandler({
  wordInput,
  wordForm,
  explainButton,
  statusMessage,
  explanationResult,
});

initializeVocabularyHandler({
  savedList,
  savedStatus,
  savedCount,
});

initializeSettingsHandler({
  apiKeyForm,
  apiKeyInput,
  saveApiKeyButton,
  removeApiKeyButton,
  apiKeyStatus,
});

// Tab navigation
const tabs = app.querySelectorAll<HTMLButtonElement>('.tab');

const explainView = getRequiredElement<HTMLElement>(
  app,
  '#explain-view',
);

const savedView = getRequiredElement<HTMLElement>(
  app,
  '#saved-view',
);

function switchTab(selectedTab: string): void {
  const isExplainTab = selectedTab === 'explain';

  explainView.hidden = !isExplainTab;
  savedView.hidden = isExplainTab;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === selectedTab;

    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedTab = tab.dataset.tab;

    if (selectedTab) {
      switchTab(selectedTab);
    }
  });
});
