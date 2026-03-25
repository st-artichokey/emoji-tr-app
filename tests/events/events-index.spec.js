import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { register } from '../../listeners/events/index.js';

describe('events/index', () => {
  it('should register app_home_opened event', () => {
    const fakeApp = { event: mock.fn() };
    register(fakeApp);

    const registeredEvents = fakeApp.event.mock.calls.map((c) => c.arguments[0]);
    assert.ok(registeredEvents.includes('app_home_opened'));
  });

  it('should register reaction_added event', () => {
    const fakeApp = { event: mock.fn() };
    register(fakeApp);

    const registeredEvents = fakeApp.event.mock.calls.map((c) => c.arguments[0]);
    assert.ok(registeredEvents.includes('reaction_added'));
  });

  it('should register callbacks as functions', () => {
    const fakeApp = { event: mock.fn() };
    register(fakeApp);

    for (const call of fakeApp.event.mock.calls) {
      assert.strictEqual(typeof call.arguments[1], 'function');
    }
  });
});
