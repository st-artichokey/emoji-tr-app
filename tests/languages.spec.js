import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  SOURCE_LANGUAGES,
  TARGET_LANGUAGES,
  getLanguageName,
  toSelectOptions,
} from '../listeners/languages.js';

describe('getLanguageName', () => {
  it('should return target language name for a target code', () => {
    assert.strictEqual(getLanguageName('fr'), 'French');
  });

  it('should return source language name when not in target map', () => {
    assert.strictEqual(getLanguageName('auto'), 'Auto-detect');
  });

  it('should fall back to the code itself for unknown codes', () => {
    assert.strictEqual(getLanguageName('xx-UNKNOWN'), 'xx-UNKNOWN');
  });

  it('should prefer target name over source name', () => {
    assert.strictEqual(getLanguageName('en-GB'), 'English (British)');
  });
});

describe('toSelectOptions', () => {
  it('should convert a language map to Slack select options', () => {
    const options = toSelectOptions({ fr: 'French', de: 'German' });
    assert.strictEqual(options.length, 2);
    assert.deepStrictEqual(options[0], {
      text: { type: 'plain_text', text: 'French' },
      value: 'fr',
    });
    assert.deepStrictEqual(options[1], {
      text: { type: 'plain_text', text: 'German' },
      value: 'de',
    });
  });

  it('should return empty array for empty map', () => {
    assert.deepStrictEqual(toSelectOptions({}), []);
  });

  it('should produce correct count for SOURCE_LANGUAGES', () => {
    const options = toSelectOptions(SOURCE_LANGUAGES);
    assert.strictEqual(options.length, Object.keys(SOURCE_LANGUAGES).length);
  });

  it('should produce correct count for TARGET_LANGUAGES', () => {
    const options = toSelectOptions(TARGET_LANGUAGES);
    assert.strictEqual(options.length, Object.keys(TARGET_LANGUAGES).length);
  });
});
