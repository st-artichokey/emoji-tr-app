import * as deepl from 'deepl-node';

/**
 * Strip Slack mrkdwn formatting to get plain text for translation.
 */
const stripSlackFormatting = (text) => {
  return text
    .replace(/<@[A-Z0-9]+>/g, '')             // remove user mentions
    .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1') // #channel links
    .replace(/<([^|>]+)\|([^>]+)>/g, '$2')     // <url|label> -> label
    .replace(/<([^>]+)>/g, '$1')               // <url> -> url
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
const translateText = async (text, sourceLang, targetLang) => {
  const authKey = process.env.DEEPL_API_KEY;
  if (!authKey) {
    throw new Error('DEEPL_API_KEY is not set');
  }

  const translator = new deepl.Translator(authKey);
  const result = await translator.translateText(text, sourceLang, targetLang);

  const translatedText = result?.text;
  if (!translatedText) {
    throw new Error('Translation returned an empty result');
  }

  return translatedText;
};

export { stripSlackFormatting, translateText };
