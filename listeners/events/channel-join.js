/**
 * Joins all public channels in the workspace.
 * Paginates through conversations.list to find channels the bot is not yet a member of.
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
          try {
            await client.conversations.join({ channel: channel.id });
            joined++;
          } catch (joinError) {
            logger.error(`Failed to join #${channel.name}: ${joinError.message}`);
          }
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
 */
const channelCreatedCallback = async ({ event, client, logger }) => {
  try {
    await client.conversations.join({ channel: event.channel.id });
    logger.info(`Joined new channel #${event.channel.name}`);
  } catch (error) {
    logger.error(`Failed to join new channel #${event.channel.name}: ${error.message}`);
  }
};

export { joinAllPublicChannels, channelCreatedCallback };
