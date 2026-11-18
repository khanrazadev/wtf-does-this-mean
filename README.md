# WTFDoesThisMean

A Chrome extension that helps you understand English words, learn how to use them naturally, and actually remember them.

## Why I made it

I look up words all the time while reading articles, watching videos, or scrolling the internet (manga too 🌚).

The problem: dictionaries tell you what a word means, but not how people actually use it. And even when I understood a word, I forgot it a few days later and looked it up again. (Classic.)

So this extension does two things:

1. Explains a word in simple English with two everyday American English examples (no textbook energy).
2. Saves every word you look up, so you can revise it instead of searching again.

And it lives right in your browser. Pretty convenient, isn't it? (ik ik)

## What it does

- Simple explanation of the word
- Part of speech (noun, verb, adjective, etc.)
- Two conversational examples
- Saves explained words automatically
- Lets you browse your saved words
- Lets you delete the ones you don't need

## Screenshots

**Explaining a word**

![Explain a word](screenshots/explain.png)

**Saved vocabulary**

![Saved vocabulary](screenshots/saved-vocabulary.png)

**API settings** (you add your own Groq API key here)

![API settings](screenshots/api-settings.png)

## How it works

The extension calls the Groq API with the `openai/gpt-oss-20b` model to generate the explanation and examples. You need your own Groq API key.

## Setup

You'll need Node.js, npm, Chrome (or any Chromium browser), and a Groq API key.

```bash
git clone https://github.com/khanrazadev/wtf-does-this-mean.git
cd wtf-does-this-mean
npm install
npm run build
```

### Load it in Chrome

After the build finishes (the easy part is over, a few clicks left):

1. Open `chrome://extensions/` in a new tab.
2. Turn on **Developer mode**
3. Click **Load unpacked**.
4. Select the `dist` folder.
5. Open the extension and paste your Groq API key in settings.

## What I want to add next

- Right-click a selected word on any webpage to explain it (way less effort)
- Better ways to revise saved words
- Ways to organize saved words
- A hosted backend, so people don't need their own API key (the dream)

## Built with

TypeScript, Vite, Chrome Extension APIs, Groq API

## Privacy

Your saved words and your API key stay in your browser. The words you ask about are sent to Groq so it can generate the answer. No account needed (I don't want your email anyway, Unless...).

## Contributing

Found a bug or have an idea? Open an issue or send a PR. (Be nice, it's a small project.)
