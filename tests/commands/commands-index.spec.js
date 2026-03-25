import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { register } from '../../listeners/commands/index.js';

describe('commands/index', () => {
  it('should register /translate command', () => {
    const fakeApp = { command: mock.fn() };
    register(fakeApp);

    assert.strictEqual(fakeApp.command.mock.callCount(), 1);
    assert.strictEqual(fakeApp.command.mock.calls[0].arguments[0], '/translate');
  });

  it('should register a function callback', () => {
    const fakeApp = { command: mock.fn() };
    register(fakeApp);

    assert.strictEqual(typeof fakeApp.command.mock.calls[0].arguments[1], 'function');
  });
});
