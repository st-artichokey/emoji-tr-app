import * as events from './events/index.js';

/**
 * Top-level registration entry point. Delegates to each listener category.
 */
export const registerListeners = (app) => {
  events.register(app);
};
