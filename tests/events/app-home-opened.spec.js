import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { appHomeOpenedCallback } from '../../listeners/events/app-home-opened.js';

describe('app-home-opened', () => {
  let fakeClient;
  let fakeEvent;
  let fakeLogger;

  beforeEach(() => {
    fakeClient = {
      views: {
        publish: mock.fn(),
      },
    };
    fakeEvent = {
      tab: 'home',
      user: 'U123',
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should publish home view when tab is home', async () => {
    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);

    const callArgs = fakeClient.views.publish.mock.calls[0].arguments[0];
    assert.strictEqual(callArgs.user_id, 'U123');
    assert.strictEqual(callArgs.view.type, 'home');
  });

  it('should include Flag Translator header in home view', async () => {
    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    const blocks = fakeClient.views.publish.mock.calls[0].arguments[0].view.blocks;
    const header = blocks.find((b) => b.type === 'header');
    assert.strictEqual(header.text.text, 'Flag Translator');
  });

  it('should include supported languages in home view', async () => {
    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    const blocks = fakeClient.views.publish.mock.calls[0].arguments[0].view.blocks;
    const langSection = blocks.find(
      (b) => b.type === 'section' && b.text?.text?.includes('Supported flag reactions'),
    );
    assert.ok(langSection, 'Should have a supported languages section');
    assert.ok(langSection.text.text.includes(':fr:'));
    assert.ok(langSection.text.text.includes('French'));
  });

  it('should include DeepL attribution', async () => {
    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    const blocks = fakeClient.views.publish.mock.calls[0].arguments[0].view.blocks;
    const context = blocks.find((b) => b.type === 'context');
    assert.ok(context);
    assert.ok(context.elements[0].text.includes('DeepL'));
  });

  it('should not publish when event tab is not home', async () => {
    fakeEvent.tab = 'about';

    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 0);
  });

  it('should log error when views.publish throws', async () => {
    const testError = new Error('publish failed');
    fakeClient.views.publish = mock.fn(() => {
      throw testError;
    });

    await appHomeOpenedCallback({
      client: fakeClient,
      event: fakeEvent,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
    assert.deepStrictEqual(fakeLogger.error.mock.calls[0].arguments, [testError]);
  });
});
