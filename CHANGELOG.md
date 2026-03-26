# Changelog

## feat: Skip translation of bot messages, file uploads, and non-text messages

- Bot/slash command messages (e.g. `/giphy`) now get a thread reply: "Translation of bot and slash command messages is not supported." (detected via `message.bot_id`)
- File/image uploads now get a thread reply: "Translation of image and file uploads is not supported." (detected via `message.files`)
- Non-text messages and empty-after-stripping messages now reply in thread instead of sending a DM
- Added edge case tests for `channel-join` (empty list, missing response_metadata, join info logging) and `stripSlackFormatting` (bare URLs, combined formatting, whitespace-only)
- Added edge case tests for reaction handler (single-letter, 3+ letter, long flag- prefix reactions)
- Total tests: 71 (up from 55)

## feat: Include country name in unsupported flag reply

- Unsupported flag reply now includes the country name (e.g. "Sorry, translation for Antarctica is not supported.")
- Added `COUNTRY_NAMES` map with all 249 ISO 3166-1 alpha-2 codes and `getCountryName()` helper to `languages.js`
- Falls back to uppercase country code for any unrecognized codes
- Added `getCountryName` tests in `tests/languages.spec.js`
- Total tests: 55

## feat: Reply when unsupported flag emoji is used

- When a user reacts with a flag emoji that has no supported language mapping, the bot now replies in the thread with the emoji and a "not supported" message
- Non-flag reactions (e.g. thumbsup) are still silently ignored
- Detects both 2-letter country codes and `flag-xx` format emoji
- Added 3 tests covering the new behavior (unmapped short code, unmapped flag-xx, error handling)

## feat: Remove /translate command and modal

- Removed `/translate` slash command, modal view, and all associated listeners (`commands/`, `views/`)
- Removed `toSelectOptions()` helper and `SOURCE_LANGUAGES` export (no longer needed)
- Removed `commands` OAuth scope from `manifest.json`
- Removed corresponding test files and directories (`tests/commands/`, `tests/views/`)
- Updated `listeners/index.js` and `tests/listeners-index.spec.js` to reflect simplified registration
- Removed `/translate` references from App Home usage instructions
- Total tests: 49 (down from 69), all remaining source files still have direct coverage

## test: Improve coverage and replace experimental module mocking

- Replaced experimental `mock.module()` with `esmock` in 3 test files, removing the `--experimental-test-module-mocks` flag
- Added tests for `getLanguageName()` and `toSelectOptions()` in new `tests/languages.spec.js`
- Added tests for `sendDM()` in new `tests/slack-helpers.spec.js`
- Added tests for `views/index.js register()` in new `tests/views/views-index.spec.js`
- Unexported internal `sendErrorDM` from `reaction-added.js` (no external consumers)
- Added 22 missing ISO 3166 country code mappings (Spanish, Arabic, German, French, Greek, Russian-speaking countries)
- Total tests: 69 (up from 55), all listener source files now have direct test coverage

## refactor: DRY up listener utilities and remove empty stubs

- Extracted `getLanguageName(code)` and `toSelectOptions(langMap)` helpers into `listeners/languages.js`
- Created shared `listeners/slack-helpers.js` with `sendDM(client, userId, text)` utility
- Replaced duplicate language option mapping in `translate-command.js` with `toSelectOptions()`
- Replaced inline DM logic in `translate-modal.js` and `reaction-added.js` with shared `sendDM()`
- Replaced repeated `LANGUAGES[code] || code` fallback in 3 files with `getLanguageName()`
- Extracted `tryJoinChannel()` in `channel-join.js` to deduplicate join-and-log pattern
- Removed empty stub directories (`actions/`, `messages/`, `shortcuts/`) and their dead imports

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
