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
        open: mock.fn(async () => ({
          channel: { id: 'D_DM' },
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

  describe('error DMs', () => {
    it('should DM user when message has no text', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ ts: '1234.5678' }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.strictEqual(dmMsg.channel, 'D_DM');
      assert.ok(dmMsg.text.includes('no text content'));
    });

    it('should DM user when stripped text is empty', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({
        messages: [{ text: '<@U123>' }],
      }));

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.ok(dmMsg.text.includes('no translatable text'));
    });

    it('should DM user when DEEPL_API_KEY is not set', async () => {
      delete process.env.DEEPL_API_KEY;

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.ok(dmMsg.text.includes('not set'));
    });

    it('should DM user when translation fails', async () => {
      mockTranslateText.mock.mockImplementation(async () => {
        throw new Error('DeepL API error');
      });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
      assert.ok(dmMsg.text.includes('French'));
      assert.ok(dmMsg.text.includes('DeepL API error'));
    });

    it('should log error if DM itself fails', async () => {
      fakeClient.conversations.history = mock.fn(async () => ({ messages: [{}] }));
      fakeClient.conversations.open = mock.fn(async () => { throw new Error('dm failed'); });

      const event = { reaction: 'fr', user: 'U_USER', item: { channel: 'C123', ts: '1234.5678' } };
      await reactionAddedCallback({ event, client: fakeClient, logger: fakeLogger });

      assert.ok(fakeLogger.error.mock.calls[0].arguments[0].includes('Failed to send error DM'));
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
