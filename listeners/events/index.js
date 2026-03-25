import { appHomeOpenedCallback } from './app-home-opened.js';
import { channelCreatedCallback } from './channel-join.js';
import { reactionAddedCallback } from './reaction-added.js';

export const register = (app) => {
  app.event('app_home_opened', appHomeOpenedCallback);
  app.event('channel_created', channelCreatedCallback);
  app.event('reaction_added', reactionAddedCallback);
};
