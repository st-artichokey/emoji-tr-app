/**
 * Attempt to join a channel, logging success or failure.
 */
const tryJoinChannel = async (client, channelId, channelName, logger) => {
  try {
    await client.conversations.join({ channel: channelId });
    return true;
  } catch (error) {
    logger.error(`Failed to join #${channelName}: ${error.message}`);
    return false;
  }
};

/**
 * Joins all public channels in the workspace.
 * Paginates through conversations.list to find channels the bot is not yet a member of.
 * @param {import('@slack/bolt').WebClient} client - Slack Web API client.
 * @param {object} logger - Bolt logger instance.
 */
const joinAllPublicChannels = async (client, logger) => {
  try {
    let cursor;
    let joined = 0;

    do {
      const result = await client.conversations.list({
        types: 'public_channel',
        exclude_archived: true,
        limit: 200,
        cursor,
      });

      for (const channel of result.channels) {
        if (!channel.is_member) {
          const success = await tryJoinChannel(client, channel.id, channel.name, logger);
          if (success) joined++;
        }
      }

      cursor = result.response_metadata?.next_cursor;
    } while (cursor);

    if (joined > 0) {
      logger.info(`Joined ${joined} public channel(s)`);
    }
  } catch (error) {
    logger.error('Failed to list/join channels:', error);
  }
};

/**
 * Handles channel_created events by joining newly created public channels.
 * @param {object} args - Bolt event callback arguments.
 * @param {object} args.event - The channel_created event payload.
 * @param {import('@slack/bolt').WebClient} args.client - Slack Web API client.
 * @param {object} args.logger - Bolt logger instance.
 */
const channelCreatedCallback = async ({ event, client, logger }) => {
  const success = await tryJoinChannel(client, event.channel.id, event.channel.name, logger);
  if (success) {
    logger.info(`Joined new channel #${event.channel.name}`);
  }
};

export { joinAllPublicChannels, channelCreatedCallback };
