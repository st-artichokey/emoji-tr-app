// All DeepL-supported source languages (code -> display name)
const SOURCE_LANGUAGES = {
  'auto': 'Auto-detect',
  'ar': 'Arabic',
  'bg': 'Bulgarian',
  'cs': 'Czech',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en': 'English',
  'es': 'Spanish',
  'et': 'Estonian',
  'fi': 'Finnish',
  'fr': 'French',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'nb': 'Norwegian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sv': 'Swedish',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'zh': 'Chinese',
};

// All DeepL-supported target languages (code -> display name)
const TARGET_LANGUAGES = {
  'ar': 'Arabic',
  'bg': 'Bulgarian',
  'cs': 'Czech',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en-GB': 'English (British)',
  'en-US': 'English (American)',
  'es': 'Spanish',
  'et': 'Estonian',
  'fi': 'Finnish',
  'fr': 'French',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'nb': 'Norwegian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'pt-BR': 'Portuguese (Brazilian)',
  'pt-PT': 'Portuguese (European)',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sv': 'Swedish',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'zh-HANS': 'Chinese (Simplified)',
  'zh-HANT': 'Chinese (Traditional)',
};

// Map Slack flag emoji reaction names to DeepL target language codes.
// Slack sends flag emoji reactions as the ISO country code (e.g. "fr", "us", "jp").
// Both short and flag-xx formats are supported.
const FLAG_TO_LANGUAGE = {
  // Direct language matches
  'bg': 'bg',    'cz': 'cs',    'dk': 'da',    'de': 'de',    'gr': 'el',
  'gb': 'en-GB', 'us': 'en-US', 'um': 'en-US', 'au': 'en-GB', 'ca': 'en-US',
  'ie': 'en-GB', 'nz': 'en-GB', 'es': 'es',    'ee': 'et',    'fi': 'fi',
  'fr': 'fr',    'hu': 'hu',    'id': 'id',    'it': 'it',    'jp': 'ja',
  'kr': 'ko',    'lt': 'lt',    'lv': 'lv',    'no': 'nb',    'nl': 'nl',
  'pl': 'pl',    'br': 'pt-BR', 'pt': 'pt-PT', 'ro': 'ro',    'ru': 'ru',
  'sk': 'sk',    'si': 'sl',    'se': 'sv',    'tr': 'tr',    'ua': 'uk',
  'cn': 'zh-HANS', 'tw': 'zh-HANT',
  // Spanish-speaking countries
  'ar': 'es',    'mx': 'es',    'co': 'es',    'cl': 'es',    'pe': 'es',
  'bo': 'es',    'cr': 'es',    'cu': 'es',    'do': 'es',    'ec': 'es',
  'gt': 'es',    'hn': 'es',    'ni': 'es',    'pa': 'es',    'py': 'es',
  'uy': 'es',    've': 'es',
  // German-speaking countries
  'at': 'de',    'ch': 'de',    'li': 'de',
  // French-speaking countries
  'be': 'fr',    'lu': 'fr',
  // English-speaking countries
  'in': 'en-GB',
  // Arabic-speaking countries
  'eg': 'ar',    'iq': 'ar',    'jo': 'ar',    'sa': 'ar',
  // Greek-speaking countries
  'cy': 'el',
  // Russian-speaking countries
  'kz': 'ru',
  // flag-xx format
  'flag-bg': 'bg',    'flag-cz': 'cs',    'flag-dk': 'da',    'flag-de': 'de',
  'flag-gr': 'el',    'flag-gb': 'en-GB', 'flag-us': 'en-US', 'flag-um': 'en-US',
  'flag-au': 'en-GB', 'flag-ca': 'en-US', 'flag-ie': 'en-GB', 'flag-nz': 'en-GB',
  'flag-es': 'es',    'flag-ee': 'et',    'flag-fi': 'fi',    'flag-fr': 'fr',
  'flag-hu': 'hu',    'flag-id': 'id',    'flag-it': 'it',    'flag-jp': 'ja',
  'flag-kr': 'ko',    'flag-lt': 'lt',    'flag-lv': 'lv',    'flag-no': 'nb',
  'flag-nl': 'nl',    'flag-pl': 'pl',    'flag-br': 'pt-BR', 'flag-pt': 'pt-PT',
  'flag-ro': 'ro',    'flag-ru': 'ru',    'flag-sk': 'sk',    'flag-si': 'sl',
  'flag-se': 'sv',    'flag-tr': 'tr',    'flag-ua': 'uk',    'flag-cn': 'zh-HANS',
  'flag-tw': 'zh-HANT', 'flag-ar': 'es', 'flag-mx': 'es',    'flag-co': 'es',
  'flag-cl': 'es',    'flag-pe': 'es',    'flag-at': 'de',    'flag-ch': 'de',
  'flag-be': 'fr',    'flag-in': 'en-GB',
  'flag-bo': 'es',    'flag-cr': 'es',    'flag-cu': 'es',    'flag-do': 'es',
  'flag-ec': 'es',    'flag-gt': 'es',    'flag-hn': 'es',    'flag-ni': 'es',
  'flag-pa': 'es',    'flag-py': 'es',    'flag-uy': 'es',    'flag-ve': 'es',
  'flag-li': 'de',    'flag-lu': 'fr',    'flag-eg': 'ar',    'flag-iq': 'ar',
  'flag-jo': 'ar',    'flag-sa': 'ar',    'flag-cy': 'el',    'flag-kz': 'ru',
};

/**
 * Look up the display name for a language code, checking both target and source maps.
 */
const getLanguageName = (code) => TARGET_LANGUAGES[code] || SOURCE_LANGUAGES[code] || code;

export { TARGET_LANGUAGES, FLAG_TO_LANGUAGE, getLanguageName };
