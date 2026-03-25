# Changelog

## feat: Add /translate command with modal for any-to-any translation (`fecf002`)

- Added `/translate` slash command that opens a modal dialog
- Modal includes source language dropdown (with Auto-detect default), target language dropdown, and multiline text input
- Supports all DeepL source and target languages, not just flag-mapped ones
- On submission, translates text and DMs the result to the user
- Shows inline modal errors if translation fails
- Added `listeners/commands/translate-command.js` for modal opening logic
- Added `listeners/views/translate-modal.js` for modal submission handling
- Registered `translate_modal` view callback in `listeners/views/index.js`

## test: Add unit tests for all listeners and utilities (`b9929c6`)

- Added 55 unit tests using Node.js built-in test runner (`node:test`)
- Tests cover reaction handler, translate command, modal submission, channel join, app home, shared translate utilities, and listener registration
- Uses `mock.module()` with `--experimental-test-module-mocks` to mock the `deepl-node` dependency
- Test files organized to mirror the `listeners/` directory structure under `tests/`

## feat: Add flag emoji reaction translation using DeepL (`777a6b0`)

- React to any message with a country flag emoji to trigger auto-translation
- Posts the translation as a threaded reply with the flag emoji and language name
- Maps 40+ country flag codes (both short `fr` and `flag-fr` formats) to DeepL target languages
- Strips Slack formatting (mentions, channel links, URLs, HTML entities) before translating
- Auto-joins all public channels on startup and new channels as they are created
- Sends a DM to the reacting user if translation fails (missing text, empty result, API error)
- Added App Home tab with usage instructions and supported flag list
- Added shared `listeners/languages.js` (source/target language maps, flag mapping) and `listeners/translate.js` (formatting strip, DeepL translate wrapper)
- Updated `manifest.json` with required scopes and event subscriptions
- Updated `app.js` to register listeners and auto-join channels on startup

## feat: Scaffold Slack Bolt JS app from starter template (`46f7ca5`)

- Initialized project from the `bolt-js-starter-template` using Slack CLI
- Includes base configuration: `package.json`, `biome.json`, `.gitignore`, `LICENSE`, `README.md`
- Stub listener directories for actions, messages, and shortcuts
- Slack CLI configuration files under `.slack/`
