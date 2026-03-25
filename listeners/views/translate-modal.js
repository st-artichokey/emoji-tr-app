import { TARGET_LANGUAGES, SOURCE_LANGUAGES } from '../languages.js';
import { translateText } from '../translate.js';

const translateModalCallback = async ({ ack, view, body, client, logger }) => {
  const values = view.state.values;
  const text = values.text_block.text_input.value;
  const sourceLangCode = values.source_lang_block.source_lang_select.selected_option.value;
  const targetLangCode = values.target_lang_block.target_lang_select.selected_option.value;

  const sourceLang = sourceLangCode === 'auto' ? null : sourceLangCode;
  const targetName = TARGET_LANGUAGES[targetLangCode] || targetLangCode;
  const sourceName = SOURCE_LANGUAGES[sourceLangCode] || sourceLangCode;

  try {
    const translatedText = await translateText(text, sourceLang, targetLangCode);

    await ack();

    // DM the user the translation result
    const dm = await client.conversations.open({ users: body.user.id });
    const fromLabel = sourceLang ? sourceName : 'Auto-detected';
    await client.chat.postMessage({
      channel: dm.channel.id,
      text: [
        `*Translation (${fromLabel} -> ${targetName}):*`,
        '',
        `> ${text}`,
        '',
        translatedText,
      ].join('\n'),
    });
  } catch (error) {
    logger.error('Modal translation failed:', error);

    // Show error in the modal
    await ack({
      response_action: 'errors',
      errors: {
        text_block: `Translation failed: ${error.message}`,
      },
    });
  }
};

export { translateModalCallback };
