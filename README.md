# Flag Translator - Slack App

A Slack app built with [Bolt for JavaScript](https://tools.slack.dev/bolt-js/) that translates messages using [DeepL](https://www.deepl.com/). Translate by reacting with a country flag emoji or by using the `/translate` slash command.

## Features

- **Flag emoji reactions** — React to any message with a country flag emoji (e.g. :fr:, :de:, :jp:) to auto-detect the source language and post a translation as a threaded reply.
- **`/translate` command** — Open a modal to translate any text between all DeepL-supported languages, with full control over source and target language.
- **Auto-join channels** — The bot automatically joins all public channels on startup and joins new channels as they are created.
- **Error notifications** — If a translation fails, the bot sends a DM to the user explaining what went wrong.

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or later
- A [Slack workspace](https://slack.com/create) where you have permission to install apps
- The [Slack CLI](https://tools.slack.dev/slack-cli/) (`slack-cli`)
- A [DeepL API key](https://www.deepl.com/pro-api) (free tier works)

## Installation

### 1. Clone the repository

```sh
git clone https://github.com/st-artichokey/claude-slack-app-demo.git
cd claude-slack-app-demo
```

### 2. Install dependencies

```sh
npm install
```

### 3. Create a Slack app

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose **From an app manifest**
2. Choose the workspace you want to install the app to
3. Copy the contents of [`manifest.json`](./manifest.json) into the text box and click **Next**
4. Review the configuration and click **Create**
5. Click **Install to Workspace** and **Allow**

### 4. Set up environment variables

1. Copy `.env.sample` to `.env`:
   ```sh
   cp .env.sample .env
   ```
2. Open your app's configuration page from [https://api.slack.com/apps](https://api.slack.com/apps):
   - Go to **OAuth & Permissions** and copy the **Bot User OAuth Token** into `SLACK_BOT_TOKEN`
   - Go to **Basic Information**, create an **App-Level Token** with the `connections:write` scope, and copy it into `SLACK_APP_TOKEN`
3. Add your DeepL API key as `DEEPL_API_KEY`

Your `.env` file should look like:

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
DEEPL_API_KEY=your-deepl-api-key
```

### 5. Run the app

Using the Slack CLI:

```sh
slack-cli platform run
```

Or directly with Node.js:

```sh
npm start
```

For development with auto-restart on file changes:

```sh
npm run dev
```

## Usage

### Flag emoji reaction

1. Find any message in a channel the bot has joined
2. React to it with a country flag emoji (e.g. :fr: for French, :de: for German, :jp: for Japanese)
3. The bot will reply in a thread with the translation

### `/translate` command

1. Type `/translate` in any channel or DM
2. A modal will open with three fields:
   - **Text to translate** — enter or paste the text
   - **From language** — select a source language or leave as Auto-detect
   - **To language** — select the target language
3. Click **Translate**
4. The bot will DM you the translation

### Supported flag reactions

| Flag | Language | Flag | Language |
|------|----------|------|----------|
| :fr: | French | :de: | German |
| :es: | Spanish | :it: | Italian |
| :jp: | Japanese | :kr: | Korean |
| :gb: | English (British) | :us: | English (American) |
| :br: | Portuguese (Brazilian) | :pt: | Portuguese (European) |
| :cn: | Chinese (Simplified) | :tw: | Chinese (Traditional) |
| :ru: | Russian | :ua: | Ukrainian |
| :pl: | Polish | :nl: | Dutch |
| :se: | Swedish | :dk: | Danish |
| :fi: | Finnish | :no: | Norwegian |
| :ro: | Romanian | :hu: | Hungarian |
| :cz: | Czech | :sk: | Slovak |
| :bg: | Bulgarian | :gr: | Greek |
| :tr: | Turkish | :id: | Indonesian |

Additional country flags (e.g. :mx:, :ar:, :at:, :ch:) are also supported and map to the appropriate language.

## Testing

```sh
npm test
```

Runs 55 unit tests using the Node.js built-in test runner.

## Project Structure

```
├── app.js                          # Entry point — starts Bolt app, auto-joins channels
├── manifest.json                   # Slack app manifest (scopes, events, commands)
├── listeners/
│   ├── index.js                    # Registers all listener groups
│   ├── languages.js                # Language maps and flag-to-language mapping
│   ├── translate.js                # Shared translation utilities (DeepL wrapper, formatting)
│   ├── commands/
│   │   ├── index.js                # Registers slash commands
│   │   └── translate-command.js    # /translate — opens the translation modal
│   ├── events/
│   │   ├── index.js                # Registers event listeners
│   │   ├── reaction-added.js       # Flag emoji reaction handler
│   │   ├── app-home-opened.js      # App Home tab content
│   │   └── channel-join.js         # Auto-join channels on startup and creation
│   └── views/
│       ├── index.js                # Registers view submission handlers
│       └── translate-modal.js      # Modal submission — translates and DMs result
└── tests/                          # Unit tests mirroring listeners/ structure
```

## Powered By

- [Slack Bolt for JavaScript](https://tools.slack.dev/bolt-js/)
- [DeepL Translate API](https://www.deepl.com/pro-api)
