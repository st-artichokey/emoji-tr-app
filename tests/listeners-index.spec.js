import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { registerListeners } from '../listeners/index.js';

describe('listeners/index', () => {
  it('should call all register functions', () => {
    const fakeApp = {
      command: mock.fn(),
      event: mock.fn(),
      view: mock.fn(),
    };

    registerListeners(fakeApp);

    // events register: app_home_opened and reaction_added
    assert.ok(fakeApp.event.mock.callCount() >= 2);
    // commands register: /translate
    assert.strictEqual(fakeApp.command.mock.callCount(), 1);
  });
});
