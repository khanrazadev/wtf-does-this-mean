
const GROQ_API_KEY_STORAGE = 'groqApiKey';

export async function getGroqApiKey(): Promise<string | null> {
    const result = await chrome.storage.local.get(GROQ_API_KEY_STORAGE);
    const apiKey: unknown = result[GROQ_API_KEY_STORAGE];

    if (typeof apiKey !== 'string' || !apiKey.trim()) {
        return null;
    }

    return apiKey.trim();
}

export async function saveGroqApiKey(apiKey: string): Promise<void> {
    const normalizedKey = apiKey.trim();

    if (!normalizedKey) {
        throw new Error('API key cannot be empty.');
    }

    await chrome.storage.local.set({
        [GROQ_API_KEY_STORAGE]: normalizedKey,
    });
}

export async function removeGroqApiKey(): Promise<void> {
    await chrome.storage.local.remove(GROQ_API_KEY_STORAGE);
}
