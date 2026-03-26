import { appHomeOpenedCallback } from './app-home-opened.js';
import { channelCreatedCallback } from './channel-join.js';
import { reactionAddedCallback } from './reaction-added.js';

/**
 * Registers all Slack event listeners on the Bolt app instance.
 */
export const register = (app) => {
  app.event('app_home_opened', appHomeOpenedCallback);
  app.event('channel_created', channelCreatedCallback);
  app.event('reaction_added', reactionAddedCallback);
};
