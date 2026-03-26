# Contributing

Thank you for your interest in contributing to Emoji Translator! This guide covers everything you need to get started.

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to make this project better.

## Getting Started

1. Fork the repository and clone your fork
2. Install dependencies: `npm install`
3. Copy `.env.sample` to `.env` and fill in your credentials (see [README](./README.md#3-configure-environment-variables))
4. Run the app locally: `npm run dev`
5. Run tests: `npm test`

## Development Environment

- **Node.js** v22 or later
- **Biome** for linting and formatting (configured in `biome.json`)
- **Node.js built-in test runner** (`node:test`) with [esmock](https://www.npmjs.com/package/esmock) for ESM module mocking

## Project Conventions

- **ESM only** — the project uses ES modules (`"type": "module"` in `package.json`)
- **Single quotes**, 2-space indentation, 120-character line width (enforced by Biome)
- **kebab-case** for directory and file names
- **JSDoc** on all exported functions with `@param` and `@returns`
- **Test files** mirror the `listeners/` directory structure under `tests/` and use the `.spec.js` suffix
- **CHANGELOG.md** must be updated with every commit

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes in focused, logical commits
3. Ensure all tests pass: `npm test`
4. Lint your code: `npm run lint`
5. Update `CHANGELOG.md` with a summary of your changes
6. Open a pull request against `main`

### Pull Request Guidelines

- Keep PRs focused on a single change
- Write a clear title and description explaining *what* changed and *why*
- Include tests for new functionality or bug fixes
- Make sure existing tests still pass

## Reporting Issues

Open an issue on GitHub with:
- A clear description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected vs. actual behavior

---

## For Contributors Not Using AI

### Workflow

1. Read through the relevant source files before making changes — start with `listeners/events/reaction-added.js` for the core translation flow
2. Write tests first (or alongside) your changes using the existing test patterns in `tests/`
3. Run `npm test` and `npm run lint` before every commit
4. Use `git log` to match the commit message style: `type: Short description` (e.g., `feat:`, `fix:`, `refactor:`, `test:`, `docs:`)

### Adding a New Language Mapping

1. Look up the country's ISO 3166-1 alpha-2 code and the corresponding [DeepL target language code](https://developers.deepl.com/docs/getting-started/supported-languages)
2. Add entries to `FLAG_TO_LANGUAGE` in `listeners/languages.js` for both the short code (`xx`) and `flag-xx` format
3. If the country is not already in `COUNTRY_NAMES`, add it there too
4. Verify the mapping is correct by running the `FLAG_TO_LANGUAGE mapping` test suite

### Adding a New Guard or Feature

1. Identify where in the `reactionAddedCallback` flow your change belongs
2. Follow the existing pattern: check a condition, post a thread reply, return early
3. Add tests covering the happy path, the error path (thread reply fails), and any edge cases
4. Update the App Home text in `app-home-opened.js` if the change is user-facing

---

## For Contributors Using AI

### Workflow

1. Start by giving your AI assistant context — point it to `README.md` for an overview and `listeners/events/reaction-added.js` for the core logic
2. Ask it to read the relevant source and test files before proposing changes
3. Have it run `npm test` and `npm run lint` after every change to catch regressions immediately
4. Review all generated code yourself before committing — verify that the logic is correct, tests are meaningful (not just passing), and no unnecessary files or abstractions were added

### Prompting Tips

- Be specific about what you want changed and where — "add a guard for messages with `subtype` in `reaction-added.js`" is better than "handle more edge cases"
- Ask the AI to follow existing patterns rather than inventing new ones
- If the AI suggests refactoring unrelated code, redirect it to focus on the task at hand
- Request that it updates `CHANGELOG.md` and writes tests as part of the same change

### What to Watch For

- **Phantom code** — AI may reference functions, files, or npm packages that don't exist in this project. Verify imports and dependencies actually resolve.
- **Over-engineering** — Resist suggestions to add abstractions, config layers, or utility files for one-off operations. Three similar lines are fine.
- **Stale context** — If your AI session is long-running, it may reference an older version of a file. Have it re-read files before making edits.
- **Silent test passes** — AI-generated tests sometimes assert on the wrong thing or use mocks that make the test pass regardless. Read each test and confirm it would fail if the feature were broken.
- **Scope creep** — AI tends to "improve" surrounding code while fixing a bug. Keep changes focused on what was asked.

### Session Logs

This project maintains development session logs in `claude-session-logs/`. If you use AI to make significant changes, consider adding a session log documenting what prompts you used, what changes were made, and what external sources were referenced. See existing logs for the format.

---

## Why Two Sections?

The traditional and AI-assisted workflows share the same standards — tests must pass, lint must be clean, changelogs must be updated, and PRs must be focused. The *process* of getting there is what differs.

A developer writing code manually has direct control over every line. Their risks are typical: missing an edge case, forgetting to update a test, or introducing a typo. The guidance they need is about *where things are* and *what patterns to follow*.

A developer using AI is operating more like a reviewer and director than a line-by-line author. They can move faster, but they face a different set of risks: code that looks correct but references things that don't exist, tests that pass without actually testing anything, unnecessary refactoring that bloats the diff, and context drift in long sessions. The guidance they need is about *what to verify* and *where AI tends to go wrong*.

Neither workflow is better or worse. Both produce good contributions when the developer understands the codebase and applies the right level of scrutiny to their work. These sections exist to give each type of contributor the most useful advice for their situation.
