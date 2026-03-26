import * as deepl from 'deepl-node';

/**
 * Strips Slack mrkdwn formatting to produce plain text suitable for translation.
 * Removes user mentions, converts channel links to #name, extracts URL labels,
 * and decodes HTML entities (&amp; &lt; &gt;). Returns empty string for
 * whitespace-only or mention-only input.
 * @param {string} text - Raw Slack message text with mrkdwn formatting.
 * @returns {string} Plain text with all Slack-specific markup removed.
 */
const stripSlackFormatting = (text) => {
  return text
    .replace(/<@[A-Z0-9]+>/g, '') // remove user mentions
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1') // #channel links
    .replace(/<([^|>]+)\|([^>]+)>/g, '$2') // <url|label> -> label
    .replace(/<([^>]+)>/g, '$1') // <url> -> url
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

/**
 * Translate text using DeepL.
 * @param {string} text - The text to translate.
 * @param {string|null} sourceLang - Source language code, or null for auto-detect.
 * @param {string} targetLang - Target language code.
 * @returns {Promise<string>} The translated text.
 * @throws {Error} If DEEPL_API_KEY is not set or translation fails.
 */
// Lazily initialized singleton — reused across calls for connection pooling
let translator;

const getTranslator = () => {
  const authKey = process.env.DEEPL_API_KEY;
  if (!authKey) {
    throw new Error('DEEPL_API_KEY is not set');
  }
  if (!translator) {
    translator = new deepl.Translator(authKey);
  }
  return translator;
};

const translateText = async (text, sourceLang, targetLang) => {
  const result = await getTranslator().translateText(text, sourceLang, targetLang);

  const translatedText = result?.text;
  if (!translatedText) {
    throw new Error('Translation returned an empty result');
  }

  return translatedText;
};

export { stripSlackFormatting, translateText };
