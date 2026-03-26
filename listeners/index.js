import * as events from './events/index.js';

/**
 * Top-level registration entry point. Delegates to each listener category.
 * @param {import('@slack/bolt').App} app - The Bolt app instance.
 */
export const registerListeners = (app) => {
  events.register(app);
};
