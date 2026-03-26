import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { registerListeners } from './listeners/index.js';
import { joinAllPublicChannels } from './listeners/events/channel-join.js';

config();

// Initialize the Bolt app with Socket Mode for local development
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG,
});

// Wire up all event listeners (reaction_added, channel_created, app_home_opened)
registerListeners(app);

// Start the app and auto-join all public channels so the bot can receive
// reaction events in every channel without needing a manual invite.
(async () => {
  try {
    await app.start();
    app.logger.info('Bolt app is running!');

    await joinAllPublicChannels(app.client, app.logger);
  } catch (error) {
    app.logger.error('Failed to start the app', error);
  }
})();
