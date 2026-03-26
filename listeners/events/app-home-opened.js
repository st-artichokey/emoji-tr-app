import { FLAG_TO_LANGUAGE, getLanguageName } from '../languages.js';

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
                '*Two ways to translate:*',
                '',
                '*1. Flag emoji reaction (quick)*',
                'React to any message with a country flag emoji and the bot will auto-detect the source language and reply with the translation in a thread.',
                '',
                '*2. `/translate` command (full control)*',
                'Use `/translate` to open a dialog where you can pick any source and target language from all supported languages, then enter text to translate.',
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
            elements: [
              { type: 'mrkdwn', text: 'Powered by DeepL Translate' },
            ],
          },
        ],
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
