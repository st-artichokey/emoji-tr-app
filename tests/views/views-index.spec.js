import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { register } from '../../listeners/views/index.js';

describe('views/index', () => {
  it('should register translate_modal view', () => {
    const fakeApp = { view: mock.fn() };
    register(fakeApp);

    assert.strictEqual(fakeApp.view.mock.callCount(), 1);
    assert.strictEqual(fakeApp.view.mock.calls[0].arguments[0], 'translate_modal');
  });

  it('should register a function callback', () => {
    const fakeApp = { view: mock.fn() };
    register(fakeApp);

    assert.strictEqual(typeof fakeApp.view.mock.calls[0].arguments[1], 'function');
  });
});
