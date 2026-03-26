import assert from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import esmock from 'esmock';

const mockTranslateText = mock.fn();

const { stripSlackFormatting, translateText } = await esmock('../listeners/translate.js', {
  'deepl-node': {
    Translator: class MockTranslator {
      constructor() {}
      translateText = mockTranslateText;
    },
  },
});

describe('stripSlackFormatting', () => {
  it('should remove user mentions', () => {
    assert.strictEqual(stripSlackFormatting('Hello <@U123ABC>!'), 'Hello !');
  });

  it('should convert channel links to #name', () => {
    assert.strictEqual(stripSlackFormatting('See <#C123|general>'), 'See #general');
  });

  it('should convert labeled URL links to label text', () => {
    assert.strictEqual(stripSlackFormatting('Visit <https://example.com|Example>'), 'Visit Example');
  });

  it('should decode HTML entities', () => {
    assert.strictEqual(stripSlackFormatting('A &amp; B &lt; C &gt; D'), 'A & B < C > D');
  });

  it('should return empty string for mention-only messages', () => {
    assert.strictEqual(stripSlackFormatting('<@U123>'), '');
  });

  it('should extract bare URLs without labels', () => {
    assert.strictEqual(stripSlackFormatting('Go to <https://example.com>'), 'Go to https://example.com');
  });

  it('should handle multiple formatting types combined', () => {
    const input = 'Hey <@U123>, see <#C456|general> and <https://x.com|link> &amp; more';
    assert.strictEqual(stripSlackFormatting(input), 'Hey , see #general and link & more');
  });

  it('should trim whitespace-only input to empty string', () => {
    assert.strictEqual(stripSlackFormatting('   \n  \t  '), '');
  });
});

describe('translateText', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.DEEPL_API_KEY;
    process.env.DEEPL_API_KEY = 'test-key';
    mockTranslateText.mock.resetCalls();
    mockTranslateText.mock.mockImplementation(async () => ({ text: 'translated' }));
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DEEPL_API_KEY = originalEnv;
    } else {
      delete process.env.DEEPL_API_KEY;
    }
  });

  it('should return translated text', async () => {
    const result = await translateText('hello', null, 'fr');
    assert.strictEqual(result, 'translated');
  });

  it('should pass source and target language to DeepL', async () => {
    await translateText('hello', 'en', 'fr');
    const [, src, tgt] = mockTranslateText.mock.calls[0].arguments;
    assert.strictEqual(src, 'en');
    assert.strictEqual(tgt, 'fr');
  });

  it('should throw if DEEPL_API_KEY is not set', async () => {
    delete process.env.DEEPL_API_KEY;
    await assert.rejects(() => translateText('hello', null, 'fr'), /DEEPL_API_KEY/);
  });

  it('should throw if translation result is empty', async () => {
    mockTranslateText.mock.mockImplementation(async () => ({ text: '' }));
    await assert.rejects(() => translateText('hello', null, 'fr'), /empty result/);
  });

  it('should throw if translation result is null', async () => {
    mockTranslateText.mock.mockImplementation(async () => null);
    await assert.rejects(() => translateText('hello', null, 'fr'), /empty result/);
  });
});
