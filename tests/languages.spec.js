import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getCountryName, getLanguageName } from '../listeners/languages.js';

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

describe('getCountryName', () => {
  it('should return country name for a known code', () => {
    assert.strictEqual(getCountryName('jp'), 'Japan');
  });

  it('should return country name for territories', () => {
    assert.strictEqual(getCountryName('aq'), 'Antarctica');
  });

  it('should fall back to uppercase code for unknown codes', () => {
    assert.strictEqual(getCountryName('zz'), 'ZZ');
  });
});
