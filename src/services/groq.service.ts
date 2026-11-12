import { getGroqApiKey } from "../storage/settings.storage";
import type { WordExplanation } from "../types/vocabulary.types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";
const REQUEST_TIMEOUT_MS = 30_000;

interface GroqChatCompletionResponse {
    choices?: Array<{
        message?: {
            content?: string | null;
        };
    }>;
    error?: {
        message?: string;
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseExplanation(content: string): WordExplanation {
    let parsed: unknown;

    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("Groq returned an invalid JSON response.");
    }

    if (!isRecord(parsed)) {
        throw new Error("Groq returned an invalid explanation.");
    }

    const { word, partOfSpeech, meaning, examples } = parsed;

    if (
        typeof word !== "string" ||
        !word.trim() ||
        typeof meaning !== "string" ||
        !meaning.trim() ||
        (partOfSpeech !== undefined && typeof partOfSpeech !== "string") ||
        !Array.isArray(examples) ||
        examples.length !== 2 ||
        !examples.every(
            (example): example is string =>
                typeof example === "string" && example.trim().length > 0,
        )
    ) {
        throw new Error("Groq returned an incomplete explanation.");
    }

    return {
        word: word.trim(),
        ...(typeof partOfSpeech === "string" && partOfSpeech.trim()
            ? { partOfSpeech: partOfSpeech.trim() }
            : {}),
        meaning: meaning.trim(),
        examples: [examples[0].trim(), examples[1].trim()],
    };
}

export async function explainWord(word: string): Promise<WordExplanation> {
    const normalizedWord = word.trim();

    if (!normalizedWord) {
        throw new Error("Please enter a word or phrase.");
    }

    const apiKey = await getGroqApiKey();

    if (!apiKey) {
        throw new Error("Groq API key not configured. Add your API key first.");
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: GROQ_MODEL,
                temperature: 0.3,
                max_completion_tokens: 512,
                response_format: {
                    type: "json_object",
                },
                messages: [
                    {
                        role: "system",
                        content: `
You are an American English vocabulary teacher.

Explain the given English word or phrase.

Return ONLY a valid JSON object.
Do not use Markdown or code fences.

Use exactly this structure:
{
  "word": "reluctant",
  "partOfSpeech": "adjective",
  "meaning": "Not wanting to do something, but doing it anyway.",
  "examples": [
    "I was reluctant to go out, but my friends convinced me.",
    "She seemed reluctant to talk about what happened."
  ]
}

Rules:
- Meaning must be one short sentence.
- Provide exactly two distinct examples.
- Examples must sound natural in everyday American English.
- Use simple, conversational language.
- Do not include anything outside the JSON object.
`.trim(),
                    },
                    {
                        role: "user",
                        content: `Explain this English word or phrase: ${normalizedWord}`,
                    },
                ],
            }),
        });

        const data: GroqChatCompletionResponse = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || `Groq API request failed (${response.status}).`,
            );
        }

        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("Groq returned an empty response.");
        }

        return parseExplanation(content);
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("The request timed out. Please try again.");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Something went wrong while contacting Groq.");
    } finally {
        clearTimeout(timeoutId);
    }
}
