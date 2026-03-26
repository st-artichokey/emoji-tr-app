import { FLAG_TO_LANGUAGE, getLanguageName } from '../languages.js';

/**
 * Publishes the App Home tab with usage instructions and the list of supported flags.
 * Only fires for the "home" tab; other tabs (e.g. messages) are ignored.
 * @param {object} args - Bolt event callback arguments.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.event - The app_home_opened event payload.
 * @param {object} args.logger - Bolt logger instance.
 */
const appHomeOpenedCallback = async ({ client, event, logger }) => {
  if (event.tab !== 'home') return;

  // Build the supported flag list (deduplicate by showing unique short-code flags only)
  const langList = Object.entries(FLAG_TO_LANGUAGE)
    .filter(([flag]) => !flag.startsWith('flag-'))
    .map(([flag, code]) => `:${flag}: -> ${getLanguageName(code)}`)
    .join('\n');

  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Flag Translator' },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Translate messages between any supported language!',
            },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                '*How to translate:*',
                '',
                'React to any message with a country flag emoji and the bot will auto-detect the source language and reply with the translation in a thread.',
              ].join('\n'),
            },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Supported flag reactions:*\n${langList}`,
            },
          },
          { type: 'divider' },
          {
            type: 'context',
            elements: [{ type: 'mrkdwn', text: 'Powered by DeepL Translate' }],
          },
        ],
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
