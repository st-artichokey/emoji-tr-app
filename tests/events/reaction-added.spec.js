import assert from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import esmock from 'esmock';

const mockTranslateText = mock.fn();

const { reactionAddedCallback } = await esmock('../../listeners/events/reaction-added.js', {
  '../../listeners/translate.js': {
    stripSlackFormatting: (await import('../../listeners/translate.js')).stripSlackFormatting,
    translateText: async (text, src, tgt) => {
      if (!process.env.DEEPL_API_KEY) throw new Error('DEEPL_API_KEY is not set');
      const result = await mockTranslateText(text, src, tgt);
      if (!result?.text) throw new Error('Translation returned an empty result');
      return result.text;
    },
  },
});
const { FLAG_TO_LANGUAGE, TARGET_LANGUAGES } = await import('../../listeners/languages.js');

describe('reaction-added', () => {
  let fakeClient;
  let fakeLogger;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.DEEPL_API_KEY;
    process.env.DEEPL_API_KEY = 'test-api-key';

    fakeClient = {
      conversations: {
        history: mock.fn(async () => ({
          messages: [{ text: 'Hello world' }],
        })),
      },
      chat: {
        postMessage: mock.fn(),
      },
    };
    fakeLogger = {
      error: mock.fn(),
    };

    mockTranslateText.mock.resetCalls();
    mockTranslateText.mock.mockImplementation(async () => ({
      text: 'Bonjour le monde',
    }));
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DEEPL_API_KEY = originalEnv;
    } else {
      delete process.env.DEEPL_API_KEY;
    }
  });

  it('should ignore non-flag reactions', async () => {
    const event = {
      reaction: 'thumbsup',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeClient.conversations.history.mock.callCount(), 0);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 0);
  });

  it('should reply with unsupported message for unmapped flag emoji', async () => {
    const event = {
      reaction: 'aq',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    assert.strictEqual(fakeClient.conversations.history.mock.callCount(), 0);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(msgArgs.channel, 'C123');
    assert.strictEqual(msgArgs.thread_ts, '1234.5678');
    assert.ok(msgArgs.text.includes(':aq:'));
    assert.ok(msgArgs.text.includes('Antarctica'));
    assert.ok(msgArgs.text.includes('not supported'));
  });

  it('should reply with unsupported message for unmapped flag-xx emoji', async () => {
    const event = {
      reaction: 'flag-aq',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.ok(msgArgs.text.includes(':flag-aq:'));
    assert.ok(msgArgs.text.includes('Antarctica'));
    assert.ok(msgArgs.text.includes('not supported'));
  });

  it('should log error if unsupported language reply fails', async () => {
    fakeClient.chat.postMessage = mock.fn(async () => { throw new Error('post failed'); });

    const event = {
      reaction: 'aq',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
  });

  it('should ignore reactions with 3+ letter names', async () => {
    const event = {
      reaction: 'abc',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeClient.conversations.history.mock.callCount(), 0);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 0);
  });

  it('should ignore single-letter reactions', async () => {
    const event = {
      reaction: 'a',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeClient.conversations.history.mock.callCount(), 0);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 0);
  });

  it('should ignore flag- prefix with more than 2 letters', async () => {
    const event = {
      reaction: 'flag-abc',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeClient.conversations.history.mock.callCount(), 0);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 0);
  });

  it('should handle short country code reactions (e.g. "fr")', async () => {
    const event = {
      reaction: 'fr',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    assert.strictEqual(mockTranslateText.mock.callCount(), 1);
    const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.ok(msgArgs.text.includes('French'));
    assert.ok(msgArgs.text.includes(':fr:'));
  });

  it('should also handle flag-xx format reactions', async () => {
    const event = {
      reaction: 'flag-fr',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(mockTranslateText.mock.callCount(), 1);
  });

  it('should call DeepL with correct target language and auto-detect source', async () => {
    const event = {
      reaction: 'jp',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    mockTranslateText.mock.mockImplementation(async () => ({ text: 'translated' }));
    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    const [text, sourceLang, targetLang] = mockTranslateText.mock.calls[0].arguments;
    assert.strictEqual(text, 'Hello world');
    assert.strictEqual(sourceLang, null);
    assert.strictEqual(targetLang, 'ja');
  });

  it('should post translation as a threaded reply', async () => {
    const event = {
      reaction: 'fr',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(msgArgs.channel, 'C123');
    assert.strictEqual(msgArgs.thread_ts, '1234.5678');
    assert.ok(msgArgs.text.includes('Bonjour le monde'));
  });

  it('should strip Slack formatting before translating', async () => {
    fakeClient.conversations.history = mock.fn(async () => ({
      messages: [{ text: 'Hey <@U123>, check <https://x.com|this link>' }],
    }));

    const event = {
      reaction: 'fr',
      user: 'U_USER',
      item: { channel: 'C123', ts: '1234.5678' },
    };

    await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

    const [text] = mockTranslateText.mock.calls[0].arguments;
    assert.strictEqual(text, 'Hey , check this link');
  });

  describe('non-text message errors', () => {
    it('should reply in thread when conversations.history returns empty messages array', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes('no text content'));
    });

    it('should reply in thread when conversations.history throws', async () => {
      fakeClient.conversations.history = mock.fn(async () => { throw new Error('history failed'); });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes('history failed'));
    });

    it('should log error when both translation and error reply fail', async () => {
      let callCount = 0;
      fakeClient.chat.postMessage = mock.fn(async () => {
        callCount++;
        if (callCount === 1) throw new Error('post failed');
        throw new Error('error reply also failed');
      });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      // First error is from translation failure, second from the error reply failure
      assert.strictEqual(fakeLogger.error.mock.callCount(), 2);
    });

    it('should reply in thread when message has no text', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ ts: '1234.5678' }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes(':fr:'));
      assert.ok(msgArgs.text.includes('no text content'));
    });

    it('should reply in thread when stripped text is empty', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: '<@U123>' }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes(':fr:'));
      assert.ok(msgArgs.text.includes('no translatable text'));
    });

    it('should reply in thread when DEEPL_API_KEY is not set', async () => {
      delete process.env.DEEPL_API_KEY;

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes('not set'));
    });

    it('should reply in thread when translation fails', async () => {
      mockTranslateText.mock.mockImplementation(async () => {
        throw new Error('DeepL API error');
      });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes('French'));
      assert.ok(msgArgs.text.includes('DeepL API error'));
    });

    it('should reply in thread when message is from a bot', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: 'hello world', bot_id: 'B_BOT' }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.strictEqual(mockTranslateText.mock.callCount(), 0);
      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes(':fr:'));
      assert.ok(msgArgs.text.includes('bot'));
    });

    it('should reply in thread when message has file uploads', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: 'check this out', files: [{ id: 'F1', mimetype: 'image/png' }] }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.strictEqual(mockTranslateText.mock.callCount(), 0);
      const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(msgArgs.channel, 'C123');
      assert.strictEqual(msgArgs.thread_ts, '1234.5678');
      assert.ok(msgArgs.text.includes(':fr:'));
      assert.ok(msgArgs.text.includes('file'));
    });

    it('should log error if bot message reply fails', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: 'hello', bot_id: 'B_BOT' }],
      }));
      fakeClient.chat.postMessage = mock.fn(async () => { throw new Error('post failed'); });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.ok(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to post bot message reply'));
    });

    it('should log error if file upload reply fails', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: 'img', files: [{ id: 'F1' }] }],
      }));
      fakeClient.chat.postMessage = mock.fn(async () => { throw new Error('post failed'); });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.ok(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to post file upload reply'));
    });

    it('should log error if non-text thread reply fails', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({ messages: [{}] }));
      fakeClient.chat.postMessage = mock.fn(async () => { throw new Error('post failed'); });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.ok(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to post non-text error reply'));
    });
  });

  describe('FLAG_TO_LANGUAGE mapping', () => {
    it('should have a target language name for every mapped code', () => {
      for (const [flag, code] of Object.entries(FLAG_TO_LANGUAGE)) {
        assert.ok(TARGET_LANGUAGES[code], `Missing target language name for ${flag} -> ${code}`);
      }
    });

    it('should support both short codes and flag-xx format', () => {
      assert.strictEqual(FLAG_TO_LANGUAGE['fr'], 'fr');
      assert.strictEqual(FLAG_TO_LANGUAGE['flag-fr'], 'fr');
    });
  });
});
