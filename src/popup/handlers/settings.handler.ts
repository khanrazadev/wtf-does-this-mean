
import {
    getGroqApiKey,
    saveGroqApiKey,
    removeGroqApiKey,
} from '../../storage/settings.storage';

interface SettingsHandlerElements {
    apiKeyForm: HTMLFormElement;
    apiKeyInput: HTMLInputElement;
    saveApiKeyButton: HTMLButtonElement;
    removeApiKeyButton: HTMLButtonElement;
    apiKeyStatus: HTMLElement;
}

export function initializeSettingsHandler({
    apiKeyForm,
    apiKeyInput,
    saveApiKeyButton,
    removeApiKeyButton,
    apiKeyStatus,
}: SettingsHandlerElements): void {
    async function loadApiKeySettings(): Promise<void> {
        try {
            const apiKey = await getGroqApiKey();

            removeApiKeyButton.hidden = !apiKey;

            apiKeyStatus.textContent = apiKey
                ? 'API key configured successfully.'
                : 'No API key configured yet.';
        } catch {
            apiKeyStatus.textContent =
                'Could not load API settings.';
        }
    }

    apiKeyForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            apiKeyStatus.textContent = 'Please enter your API key.';
            return;
        }

        saveApiKeyButton.disabled = true;
        apiKeyStatus.textContent = 'Saving API key...';

        try {
            await saveGroqApiKey(apiKey);

            apiKeyInput.value = '';
            removeApiKeyButton.hidden = false;

            apiKeyStatus.textContent =
                'API key saved successfully.';
        } catch {
            apiKeyStatus.textContent =
                'Could not save API key. Try again.';
        } finally {
            saveApiKeyButton.disabled = false;
        }
    });

    removeApiKeyButton.addEventListener('click', async () => {
        removeApiKeyButton.disabled = true;

        try {
            await removeGroqApiKey();

            apiKeyInput.value = '';
            removeApiKeyButton.hidden = true;

            apiKeyStatus.textContent =
                'API key removed successfully.';
        } catch {
            apiKeyStatus.textContent =
                'Could not remove API key.';
        } finally {
            removeApiKeyButton.disabled = false;
        }
    });

    void loadApiKeySettings();
}
