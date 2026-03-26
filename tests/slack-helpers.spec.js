import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { sendDM } from '../listeners/slack-helpers.js';

describe('sendDM', () => {
  let fakeClient;

  beforeEach(() => {
    fakeClient = {
      conversations: {
        open: mock.fn(async () => ({ channel: { id: 'D_DM' } })),
      },
      chat: {
        postMessage: mock.fn(),
      },
    };
  });

  it('should open a DM conversation with the user', async () => {
    await sendDM(fakeClient, 'U_USER', 'hello');

    assert.strictEqual(fakeClient.conversations.open.mock.callCount(), 1);
    assert.strictEqual(fakeClient.conversations.open.mock.calls[0].arguments[0].users, 'U_USER');
  });

  it('should post the message to the opened DM channel', async () => {
    await sendDM(fakeClient, 'U_USER', 'hello');

    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);
    const msgArgs = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(msgArgs.channel, 'D_DM');
    assert.strictEqual(msgArgs.text, 'hello');
  });

  it('should propagate errors from conversations.open', async () => {
    fakeClient.conversations.open = mock.fn(async () => { throw new Error('open failed'); });

    await assert.rejects(() => sendDM(fakeClient, 'U_USER', 'hello'), /open failed/);
  });

  it('should propagate errors from chat.postMessage', async () => {
    fakeClient.chat.postMessage = mock.fn(async () => { throw new Error('post failed'); });

    await assert.rejects(() => sendDM(fakeClient, 'U_USER', 'hello'), /post failed/);
  });
});
