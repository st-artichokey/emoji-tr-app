// DeepL-supported source language codes -> display names.
// Used internally by getLanguageName() as a fallback when a code isn't in TARGET_LANGUAGES.
// See: https://developers.deepl.com/docs/getting-started/supported-languages
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

// DeepL-supported target language codes -> display names.
// These are the languages users can translate into via flag reactions.
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

// Maps Slack flag emoji reaction names to DeepL target language codes.
// Slack sends flag reactions as either a 2-letter ISO code ("fr") or "flag-xx" ("flag-fr").
// Multiple countries can map to the same language (e.g. ar, mx, co -> es for Spanish).
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

// ISO 3166-1 alpha-2 country code to country name, for unsupported-language replies.
const COUNTRY_NAMES = {
  'ad': 'Andorra', 'ae': 'United Arab Emirates', 'af': 'Afghanistan', 'ag': 'Antigua and Barbuda',
  'ai': 'Anguilla', 'al': 'Albania', 'am': 'Armenia', 'ao': 'Angola', 'aq': 'Antarctica',
  'ar': 'Argentina', 'as': 'American Samoa', 'at': 'Austria', 'au': 'Australia', 'aw': 'Aruba',
  'ax': 'Åland Islands', 'az': 'Azerbaijan', 'ba': 'Bosnia and Herzegovina', 'bb': 'Barbados',
  'bd': 'Bangladesh', 'be': 'Belgium', 'bf': 'Burkina Faso', 'bg': 'Bulgaria', 'bh': 'Bahrain',
  'bi': 'Burundi', 'bj': 'Benin', 'bl': 'Saint Barthélemy', 'bm': 'Bermuda', 'bn': 'Brunei',
  'bo': 'Bolivia', 'bq': 'Caribbean Netherlands', 'br': 'Brazil', 'bs': 'Bahamas', 'bt': 'Bhutan',
  'bv': 'Bouvet Island', 'bw': 'Botswana', 'by': 'Belarus', 'bz': 'Belize', 'ca': 'Canada',
  'cc': 'Cocos Islands', 'cd': 'DR Congo', 'cf': 'Central African Republic', 'cg': 'Congo',
  'ch': 'Switzerland', 'ci': 'Côte d\'Ivoire', 'ck': 'Cook Islands', 'cl': 'Chile', 'cm': 'Cameroon',
  'cn': 'China', 'co': 'Colombia', 'cr': 'Costa Rica', 'cu': 'Cuba', 'cv': 'Cape Verde',
  'cw': 'Curaçao', 'cx': 'Christmas Island', 'cy': 'Cyprus', 'cz': 'Czechia', 'de': 'Germany',
  'dj': 'Djibouti', 'dk': 'Denmark', 'dm': 'Dominica', 'do': 'Dominican Republic', 'dz': 'Algeria',
  'ec': 'Ecuador', 'ee': 'Estonia', 'eg': 'Egypt', 'eh': 'Western Sahara', 'er': 'Eritrea',
  'es': 'Spain', 'et': 'Ethiopia', 'fi': 'Finland', 'fj': 'Fiji', 'fk': 'Falkland Islands',
  'fm': 'Micronesia', 'fo': 'Faroe Islands', 'fr': 'France', 'ga': 'Gabon', 'gb': 'United Kingdom',
  'gd': 'Grenada', 'ge': 'Georgia', 'gf': 'French Guiana', 'gg': 'Guernsey', 'gh': 'Ghana',
  'gi': 'Gibraltar', 'gl': 'Greenland', 'gm': 'Gambia', 'gn': 'Guinea', 'gp': 'Guadeloupe',
  'gq': 'Equatorial Guinea', 'gr': 'Greece', 'gt': 'Guatemala', 'gu': 'Guam',
  'gw': 'Guinea-Bissau', 'gy': 'Guyana', 'hk': 'Hong Kong', 'hn': 'Honduras', 'hr': 'Croatia',
  'ht': 'Haiti', 'hu': 'Hungary', 'id': 'Indonesia', 'ie': 'Ireland', 'il': 'Israel',
  'im': 'Isle of Man', 'in': 'India', 'io': 'British Indian Ocean Territory', 'iq': 'Iraq',
  'ir': 'Iran', 'is': 'Iceland', 'it': 'Italy', 'je': 'Jersey', 'jm': 'Jamaica', 'jo': 'Jordan',
  'jp': 'Japan', 'ke': 'Kenya', 'kg': 'Kyrgyzstan', 'kh': 'Cambodia', 'ki': 'Kiribati',
  'km': 'Comoros', 'kn': 'Saint Kitts and Nevis', 'kp': 'North Korea', 'kr': 'South Korea',
  'kw': 'Kuwait', 'ky': 'Cayman Islands', 'kz': 'Kazakhstan', 'la': 'Laos', 'lb': 'Lebanon',
  'lc': 'Saint Lucia', 'li': 'Liechtenstein', 'lk': 'Sri Lanka', 'lr': 'Liberia', 'ls': 'Lesotho',
  'lt': 'Lithuania', 'lu': 'Luxembourg', 'lv': 'Latvia', 'ly': 'Libya', 'ma': 'Morocco',
  'mc': 'Monaco', 'md': 'Moldova', 'me': 'Montenegro', 'mf': 'Saint Martin', 'mg': 'Madagascar',
  'mh': 'Marshall Islands', 'mk': 'North Macedonia', 'ml': 'Mali', 'mm': 'Myanmar', 'mn': 'Mongolia',
  'mo': 'Macao', 'mp': 'Northern Mariana Islands', 'mq': 'Martinique', 'mr': 'Mauritania',
  'ms': 'Montserrat', 'mt': 'Malta', 'mu': 'Mauritius', 'mv': 'Maldives', 'mw': 'Malawi',
  'mx': 'Mexico', 'my': 'Malaysia', 'mz': 'Mozambique', 'na': 'Namibia', 'nc': 'New Caledonia',
  'ne': 'Niger', 'nf': 'Norfolk Island', 'ng': 'Nigeria', 'ni': 'Nicaragua', 'nl': 'Netherlands',
  'no': 'Norway', 'np': 'Nepal', 'nr': 'Nauru', 'nu': 'Niue', 'nz': 'New Zealand', 'om': 'Oman',
  'pa': 'Panama', 'pe': 'Peru', 'pf': 'French Polynesia', 'pg': 'Papua New Guinea',
  'ph': 'Philippines', 'pk': 'Pakistan', 'pl': 'Poland', 'pm': 'Saint Pierre and Miquelon',
  'pn': 'Pitcairn Islands', 'pr': 'Puerto Rico', 'ps': 'Palestine', 'pt': 'Portugal', 'pw': 'Palau',
  'py': 'Paraguay', 'qa': 'Qatar', 're': 'Réunion', 'ro': 'Romania', 'rs': 'Serbia', 'ru': 'Russia',
  'rw': 'Rwanda', 'sa': 'Saudi Arabia', 'sb': 'Solomon Islands', 'sc': 'Seychelles', 'sd': 'Sudan',
  'se': 'Sweden', 'sg': 'Singapore', 'sh': 'Saint Helena', 'si': 'Slovenia', 'sj': 'Svalbard',
  'sk': 'Slovakia', 'sl': 'Sierra Leone', 'sm': 'San Marino', 'sn': 'Senegal', 'so': 'Somalia',
  'sr': 'Suriname', 'ss': 'South Sudan', 'st': 'São Tomé and Príncipe', 'sv': 'El Salvador',
  'sx': 'Sint Maarten', 'sy': 'Syria', 'sz': 'Eswatini', 'tc': 'Turks and Caicos Islands',
  'td': 'Chad', 'tf': 'French Southern Territories', 'tg': 'Togo', 'th': 'Thailand',
  'tj': 'Tajikistan', 'tk': 'Tokelau', 'tl': 'Timor-Leste', 'tm': 'Turkmenistan', 'tn': 'Tunisia',
  'to': 'Tonga', 'tr': 'Turkey', 'tt': 'Trinidad and Tobago', 'tv': 'Tuvalu', 'tw': 'Taiwan',
  'tz': 'Tanzania', 'ua': 'Ukraine', 'ug': 'Uganda', 'um': 'U.S. Minor Outlying Islands',
  'us': 'United States', 'uy': 'Uruguay', 'uz': 'Uzbekistan', 'va': 'Vatican City',
  'vc': 'Saint Vincent and the Grenadines', 've': 'Venezuela', 'vg': 'British Virgin Islands',
  'vi': 'U.S. Virgin Islands', 'vn': 'Vietnam', 'vu': 'Vanuatu', 'wf': 'Wallis and Futuna',
  'ws': 'Samoa', 'ye': 'Yemen', 'yt': 'Mayotte', 'za': 'South Africa', 'zm': 'Zambia',
  'zw': 'Zimbabwe',
};

/**
 * Returns the human-readable name for a DeepL language code.
 * Checks target languages first, then source languages, falling back to the raw code.
 * @param {string} code - A DeepL language code (e.g. "fr", "en-GB", "zh-HANS").
 * @returns {string} The display name (e.g. "French", "English (British)").
 */
const getLanguageName = (code) => TARGET_LANGUAGES[code] || SOURCE_LANGUAGES[code] || code;

/**
 * Returns the country name for a 2-letter ISO 3166-1 alpha-2 code.
 * Falls back to the uppercase code if not found in the COUNTRY_NAMES map.
 * @param {string} code - A lowercase ISO country code (e.g. "fr", "aq").
 * @returns {string} The country name (e.g. "France", "Antarctica").
 */
const getCountryName = (code) => COUNTRY_NAMES[code] || code.toUpperCase();

export { TARGET_LANGUAGES, FLAG_TO_LANGUAGE, getLanguageName, getCountryName };
