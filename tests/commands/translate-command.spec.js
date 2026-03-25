import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { translateCommandCallback } from '../../listeners/commands/translate-command.js';

describe('translate-command', () => {
  let fakeAck;
  let fakeClient;
  let fakeBody;
  let fakeLogger;

  beforeEach(() => {
    fakeAck = mock.fn();
    fakeClient = {
      views: { open: mock.fn() },
    };
    fakeBody = { trigger_id: 'T_TRIGGER' };
    fakeLogger = { error: mock.fn() };
  });

  it('should acknowledge the command', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should open a modal with views.open', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    assert.strictEqual(fakeClient.views.open.mock.callCount(), 1);
  });

  it('should use the trigger_id from the body', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    const args = fakeClient.views.open.mock.calls[0].arguments[0];
    assert.strictEqual(args.trigger_id, 'T_TRIGGER');
  });

  it('should have callback_id translate_modal', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    const view = fakeClient.views.open.mock.calls[0].arguments[0].view;
    assert.strictEqual(view.callback_id, 'translate_modal');
  });

  it('should include text input, source language, and target language blocks', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    const blocks = fakeClient.views.open.mock.calls[0].arguments[0].view.blocks;
    const blockIds = blocks.map((b) => b.block_id);
    assert.ok(blockIds.includes('text_block'));
    assert.ok(blockIds.includes('source_lang_block'));
    assert.ok(blockIds.includes('target_lang_block'));
  });

  it('should default source language to Auto-detect', async () => {
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    const blocks = fakeClient.views.open.mock.calls[0].arguments[0].view.blocks;
    const sourceBlock = blocks.find((b) => b.block_id === 'source_lang_block');
    assert.strictEqual(sourceBlock.element.initial_option.value, 'auto');
    assert.strictEqual(sourceBlock.element.initial_option.text.text, 'Auto-detect');
  });

  it('should log error when views.open throws', async () => {
    const err = new Error('open failed');
    fakeClient.views.open = mock.fn(() => { throw err; });
    await translateCommandCallback({ ack: fakeAck, body: fakeBody, client: fakeClient, logger: fakeLogger });
    assert.deepStrictEqual(fakeLogger.error.mock.calls[0].arguments, [err]);
  });
});
