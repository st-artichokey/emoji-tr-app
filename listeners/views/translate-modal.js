import { getLanguageName } from '../languages.js';
import { sendDM } from '../slack-helpers.js';
import { translateText } from '../translate.js';

const translateModalCallback = async ({ ack, view, body, client, logger }) => {
  const values = view.state.values;
  const text = values.text_block.text_input.value;
  const sourceLangCode = values.source_lang_block.source_lang_select.selected_option.value;
  const targetLangCode = values.target_lang_block.target_lang_select.selected_option.value;

  const sourceLang = sourceLangCode === 'auto' ? null : sourceLangCode;
  const targetName = getLanguageName(targetLangCode);
  const sourceName = getLanguageName(sourceLangCode);

  try {
    const translatedText = await translateText(text, sourceLang, targetLangCode);

    await ack();

    const fromLabel = sourceLang ? sourceName : 'Auto-detected';
    await sendDM(client, body.user.id, [
      `*Translation (${fromLabel} -> ${targetName}):*`,
      '',
      `> ${text}`,
      '',
      translatedText,
    ].join('\n'));
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
