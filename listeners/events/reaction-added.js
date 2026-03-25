import { FLAG_TO_LANGUAGE, TARGET_LANGUAGES } from '../languages.js';
import { stripSlackFormatting, translateText } from '../translate.js';

/**
 * Sends a DM to a user explaining that translation failed.
 */
const sendErrorDM = async (client, userId, reason, logger) => {
  try {
    const dm = await client.conversations.open({ users: userId });
    await client.chat.postMessage({
      channel: dm.channel.id,
      text: `Sorry, I couldn't translate that message. ${reason}`,
    });
  } catch (dmError) {
    logger.error('Failed to send error DM:', dmError);
  }
};

const reactionAddedCallback = async ({ event, client, logger }) => {
  const reaction = event.reaction;
  const targetLang = FLAG_TO_LANGUAGE[reaction];

  if (!targetLang) return;

  const userId = event.user;
  const langName = TARGET_LANGUAGES[targetLang] || targetLang;

  try {
    const result = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      inclusive: true,
      limit: 1,
    });

    const message = result.messages?.[0];
    if (!message || !message.text) {
      await sendErrorDM(client, userId, 'The message had no text content to translate.', logger);
      return;
    }

    const plainText = stripSlackFormatting(message.text);
    if (!plainText) {
      await sendErrorDM(client, userId, 'The message had no translatable text content.', logger);
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

export { reactionAddedCallback, sendErrorDM };
