import { SOURCE_LANGUAGES, TARGET_LANGUAGES, toSelectOptions } from '../languages.js';

const sourceOptions = toSelectOptions(SOURCE_LANGUAGES);
const targetOptions = toSelectOptions(TARGET_LANGUAGES);

const translateCommandCallback = async ({ ack, body, client, logger }) => {
  try {
    await ack();

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'translate_modal',
        title: {
          type: 'plain_text',
          text: 'Translate Text',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'text_block',
            label: { type: 'plain_text', text: 'Text to translate' },
            element: {
              type: 'plain_text_input',
              action_id: 'text_input',
              multiline: true,
              placeholder: { type: 'plain_text', text: 'Enter text to translate...' },
            },
          },
          {
            type: 'input',
            block_id: 'source_lang_block',
            label: { type: 'plain_text', text: 'From language' },
            element: {
              type: 'static_select',
              action_id: 'source_lang_select',
              placeholder: { type: 'plain_text', text: 'Select source language' },
              initial_option: sourceOptions[0], // Auto-detect
              options: sourceOptions,
            },
          },
          {
            type: 'input',
            block_id: 'target_lang_block',
            label: { type: 'plain_text', text: 'To language' },
            element: {
              type: 'static_select',
              action_id: 'target_lang_select',
              placeholder: { type: 'plain_text', text: 'Select target language' },
              options: targetOptions,
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Translate',
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }
};

export { translateCommandCallback };
