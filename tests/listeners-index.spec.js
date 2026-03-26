import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { registerListeners } from '../listeners/index.js';

describe('listeners/index', () => {
  it('should call all register functions', () => {
    const fakeApp = {
      event: mock.fn(),
    };

    registerListeners(fakeApp);

    // events register: app_home_opened, channel_created, and reaction_added
    assert.ok(fakeApp.event.mock.callCount() >= 3);
  });
});
