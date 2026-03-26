import { FLAG_TO_LANGUAGE, getCountryName, getLanguageName } from '../languages.js';
import { sendDM } from '../slack-helpers.js';
import { stripSlackFormatting, translateText } from '../translate.js';

/**
 * Sends a DM to a user explaining that translation failed.
 */
const sendErrorDM = async (client, userId, reason, logger) => {
  try {
    await sendDM(client, userId, `Sorry, I couldn't translate that message. ${reason}`);
  } catch (dmError) {
    logger.error('Failed to send error DM:', dmError);
  }
};

const isFlagEmoji = (reaction) =>
  /^flag-[a-z]{2}$/.test(reaction) || /^[a-z]{2}$/.test(reaction);

const reactionAddedCallback = async ({ event, client, logger }) => {
  const reaction = event.reaction;
  const targetLang = FLAG_TO_LANGUAGE[reaction];

  if (!targetLang) {
    if (isFlagEmoji(reaction)) {
      const countryCode = reaction.replace('flag-', '');
      const countryName = getCountryName(countryCode);
      try {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `:${reaction}: Sorry, translation for ${countryName} is not supported.`,
        });
      } catch (error) {
        logger.error('Failed to post unsupported language reply:', error);
      }
    }
    return;
  }

  const userId = event.user;
  const langName = getLanguageName(targetLang);

  try {
    const result = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      inclusive: true,
      limit: 1,
    });

    const message = result.messages?.[0];
    if (!message || !message.text) {
      try {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `:${reaction}: This message has no text content to translate.`,
        });
      } catch (replyError) {
        logger.error('Failed to post non-text error reply:', replyError);
      }
      return;
    }

    if (message.bot_id) {
      try {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `:${reaction}: Translation of bot and slash command messages is not supported.`,
        });
      } catch (replyError) {
        logger.error('Failed to post bot message reply:', replyError);
      }
      return;
    }

    if (message.files?.length > 0) {
      try {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `:${reaction}: Translation of image and file uploads is not supported.`,
        });
      } catch (replyError) {
        logger.error('Failed to post file upload reply:', replyError);
      }
      return;
    }

    const plainText = stripSlackFormatting(message.text);
    if (!plainText) {
      try {
        await client.chat.postMessage({
          channel: event.item.channel,
          thread_ts: event.item.ts,
          text: `:${reaction}: This message has no translatable text content.`,
        });
      } catch (replyError) {
        logger.error('Failed to post non-text error reply:', replyError);
      }
      return;
    }

    const translatedText = await translateText(plainText, null, targetLang);

    await client.chat.postMessage({
      channel: event.item.channel,
      thread_ts: event.item.ts,
      text: `:${reaction}: *${langName} translation:*\n${translatedText}`,
    });
  } catch (error) {
    logger.error('Translation failed:', error);
    await sendErrorDM(
      client,
      userId,
      `Translation to ${langName} failed: ${error.message}`,
      logger,
    );
  }
};

export { reactionAddedCallback };
