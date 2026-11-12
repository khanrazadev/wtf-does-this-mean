
import './popup.css';

import { popupMarkup } from "./components/popup-view";

import { getRequiredElement } from './utils/dom.utils';

import { initializeExplainHandler } from './handlers/explain.handler';
import { initializeVocabularyHandler } from './handlers/vocabulary.handler';
import { initializeSettingsHandler } from './handlers/settings.handler';

// Initialize popup

const app = getRequiredElement<HTMLDivElement>(
  document,
  '#app',
);

app.innerHTML = popupMarkup;

// DOM elements

const tabs = app.querySelectorAll<HTMLButtonElement>(
  '[data-tab]',
);

const explainView = getRequiredElement<HTMLElement>(
  app,
  '#explain-view',
);

const savedView = getRequiredElement<HTMLElement>(
  app,
  '#saved-view',
);

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

const savedSearch = getRequiredElement<HTMLInputElement>(
  app,
  '#saved-search',
);

const savedList = getRequiredElement<HTMLDivElement>(
  app,
  '#saved-list',
);

const savedStatus = getRequiredElement<HTMLElement>(
  app,
  '#saved-status',
);

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
  savedSearch,
  savedList,
  savedStatus,
});

initializeSettingsHandler({
  apiKeyForm,
  apiKeyInput,
  saveApiKeyButton,
  removeApiKeyButton,
  apiKeyStatus,
});

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
    // Refresh saved vocabulary whenever the Saved tab opens.
    savedSearch.dispatchEvent(new Event('input'));
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
