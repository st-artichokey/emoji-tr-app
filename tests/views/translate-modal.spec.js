import assert from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import esmock from 'esmock';

const mockTranslateText = mock.fn();

const { translateModalCallback } = await esmock('../../listeners/views/translate-modal.js', {
  '../../listeners/translate.js': {
    translateText: async (text, src, tgt) => {
      const result = await mockTranslateText(text, src, tgt);
      if (!result?.text) throw new Error('Translation returned an empty result');
      return result.text;
    },
  },
});

describe('translate-modal', () => {
  let fakeAck;
  let fakeClient;
  let fakeBody;
  let fakeView;
  let fakeLogger;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.DEEPL_API_KEY;
    process.env.DEEPL_API_KEY = 'test-key';

    fakeAck = mock.fn();
    fakeClient = {
      conversations: {
        open: mock.fn(async () => ({ channel: { id: 'D_DM' } })),
      },
      chat: {
        postMessage: mock.fn(),
      },
    };
    fakeBody = { user: { id: 'U_USER' } };
    fakeView = {
      state: {
        values: {
          text_block: { text_input: { value: 'Hello world' } },
          source_lang_block: {
            source_lang_select: { selected_option: { value: 'auto' } },
          },
          target_lang_block: {
            target_lang_select: { selected_option: { value: 'fr' } },
          },
        },
      },
    };
    fakeLogger = { error: mock.fn() };

    mockTranslateText.mock.resetCalls();
    mockTranslateText.mock.mockImplementation(async () => ({ text: 'Bonjour le monde' }));
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DEEPL_API_KEY = originalEnv;
    } else {
      delete process.env.DEEPL_API_KEY;
    }
  });

  it('should ack and DM the user with the translation', async () => {
    await translateModalCallback({
      ack: fakeAck, view: fakeView, body: fakeBody, client: fakeClient, logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.conversations.open.mock.callCount(), 1);
    assert.strictEqual(fakeClient.conversations.open.mock.calls[0].arguments[0].users, 'U_USER');

    const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(dmMsg.channel, 'D_DM');
    assert.ok(dmMsg.text.includes('Bonjour le monde'));
    assert.ok(dmMsg.text.includes('French'));
  });

  it('should pass null source language when auto-detect is selected', async () => {
    await translateModalCallback({
      ack: fakeAck, view: fakeView, body: fakeBody, client: fakeClient, logger: fakeLogger,
    });

    const [, src, tgt] = mockTranslateText.mock.calls[0].arguments;
    assert.strictEqual(src, null);
    assert.strictEqual(tgt, 'fr');
  });

  it('should pass explicit source language when selected', async () => {
    fakeView.state.values.source_lang_block.source_lang_select.selected_option.value = 'en';

    await translateModalCallback({
      ack: fakeAck, view: fakeView, body: fakeBody, client: fakeClient, logger: fakeLogger,
    });

    const [, src] = mockTranslateText.mock.calls[0].arguments;
    assert.strictEqual(src, 'en');
  });

  it('should show modal error when translation fails', async () => {
    mockTranslateText.mock.mockImplementation(async () => {
      throw new Error('API quota exceeded');
    });

    await translateModalCallback({
      ack: fakeAck, view: fakeView, body: fakeBody, client: fakeClient, logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    const ackArgs = fakeAck.mock.calls[0].arguments[0];
    assert.strictEqual(ackArgs.response_action, 'errors');
    assert.ok(ackArgs.errors.text_block.includes('API quota exceeded'));
  });

  it('should include source and target names in the DM', async () => {
    fakeView.state.values.source_lang_block.source_lang_select.selected_option.value = 'de';
    fakeView.state.values.target_lang_block.target_lang_select.selected_option.value = 'ja';
    mockTranslateText.mock.mockImplementation(async () => ({ text: 'translated' }));

    await translateModalCallback({
      ack: fakeAck, view: fakeView, body: fakeBody, client: fakeClient, logger: fakeLogger,
    });

    const dmMsg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.ok(dmMsg.text.includes('German'));
    assert.ok(dmMsg.text.includes('Japanese'));
  });
});
