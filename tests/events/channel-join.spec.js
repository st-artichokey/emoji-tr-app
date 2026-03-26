import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { joinAllPublicChannels, channelCreatedCallback } from '../../listeners/events/channel-join.js';

describe('joinAllPublicChannels', () => {
  let fakeClient;
  let fakeLogger;

  beforeEach(() => {
    fakeLogger = {
      info: mock.fn(),
      error: mock.fn(),
    };
  });

  it('should join channels the bot is not a member of', async () => {
    fakeClient = {
      conversations: {
        list: mock.fn(async () => ({
          channels: [
            { id: 'C1', name: 'general', is_member: true },
            { id: 'C2', name: 'random', is_member: false },
            { id: 'C3', name: 'dev', is_member: false },
          ],
          response_metadata: { next_cursor: '' },
        })),
        join: mock.fn(),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeClient.conversations.join.mock.callCount(), 2);
    assert.strictEqual(fakeClient.conversations.join.mock.calls[0].arguments[0].channel, 'C2');
    assert.strictEqual(fakeClient.conversations.join.mock.calls[1].arguments[0].channel, 'C3');
  });

  it('should not join any channels if already a member of all', async () => {
    fakeClient = {
      conversations: {
        list: mock.fn(async () => ({
          channels: [
            { id: 'C1', name: 'general', is_member: true },
          ],
          response_metadata: { next_cursor: '' },
        })),
        join: mock.fn(),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeClient.conversations.join.mock.callCount(), 0);
  });

  it('should paginate through all channels', async () => {
    let callCount = 0;
    fakeClient = {
      conversations: {
        list: mock.fn(async () => {
          callCount++;
          if (callCount === 1) {
            return {
              channels: [{ id: 'C1', name: 'page1', is_member: false }],
              response_metadata: { next_cursor: 'cursor123' },
            };
          }
          return {
            channels: [{ id: 'C2', name: 'page2', is_member: false }],
            response_metadata: { next_cursor: '' },
          };
        }),
        join: mock.fn(),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeClient.conversations.list.mock.callCount(), 2);
    assert.strictEqual(fakeClient.conversations.join.mock.callCount(), 2);
  });

  it('should log error if a single channel join fails but continue', async () => {
    fakeClient = {
      conversations: {
        list: mock.fn(async () => ({
          channels: [
            { id: 'C1', name: 'restricted', is_member: false },
            { id: 'C2', name: 'open', is_member: false },
          ],
          response_metadata: { next_cursor: '' },
        })),
        join: mock.fn(async ({ channel }) => {
          if (channel === 'C1') throw new Error('cannot_join');
        }),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeClient.conversations.join.mock.callCount(), 2);
    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
    assert.ok(fakeLogger.error.mock.calls[0].arguments[0].includes('restricted'));
  });

  it('should log error if conversations.list fails', async () => {
    fakeClient = {
      conversations: {
        list: mock.fn(async () => {
          throw new Error('list failed');
        }),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
  });

  it('should log count of joined channels', async () => {
    fakeClient = {
      conversations: {
        list: mock.fn(async () => ({
          channels: [
            { id: 'C1', name: 'chan1', is_member: false },
          ],
          response_metadata: { next_cursor: '' },
        })),
        join: mock.fn(),
      },
    };

    await joinAllPublicChannels(fakeClient, fakeLogger);

    assert.strictEqual(fakeLogger.info.mock.callCount(), 1);
    assert.ok(fakeLogger.info.mock.calls[0].arguments[0].includes('1'));
  });
});

describe('channelCreatedCallback', () => {
  it('should join the newly created channel', async () => {
    const fakeClient = {
      conversations: { join: mock.fn() },
    };
    const fakeLogger = { info: mock.fn(), error: mock.fn() };
    const event = { channel: { id: 'C_NEW', name: 'new-channel' } };

    await channelCreatedCallback({ event, client: fakeClient, logger: fakeLogger });

    assert.strictEqual(fakeClient.conversations.join.mock.callCount(), 1);
    assert.strictEqual(fakeClient.conversations.join.mock.calls[0].arguments[0].channel, 'C_NEW');
  });

  it('should log error if join fails', async () => {
    const fakeClient = {
      conversations: {
        join: mock.fn(async () => {
          throw new Error('join failed');
        }),
      },
    };
    const fakeLogger = { info: mock.fn(), error: mock.fn() };
    const event = { channel: { id: 'C_NEW', name: 'new-channel' } };

    await channelCreatedCallback({ event, client: fakeClient, logger: fakeLogger });

    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
  });
});
