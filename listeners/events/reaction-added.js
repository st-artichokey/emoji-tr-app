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

/**
 * Checks whether a Slack reaction name looks like a country flag emoji.
 * Matches both 2-letter ISO codes ("fr") and the "flag-xx" format ("flag-fr").
 */
const isFlagEmoji = (reaction) =>
  /^flag-[a-z]{2}$/.test(reaction) || /^[a-z]{2}$/.test(reaction);

/**
 * Handles reaction_added events by translating the reacted-to message.
 *
 * Flow:
 *  1. Ignore non-flag reactions entirely.
 *  2. For flag reactions without a language mapping, reply that the language is unsupported.
 *  3. Fetch the original message and reject non-translatable content (no text,
 *     bot/slash-command output, file uploads, or mentions-only messages).
 *  4. Translate via DeepL and post the result as a threaded reply.
 *  5. On translation failure, DM the reacting user with the error details.
 */
const reactionAddedCallback = async ({ event, client, logger }) => {
  const reaction = event.reaction;
  const targetLang = FLAG_TO_LANGUAGE[reaction];

  // Unmapped flag emoji — notify in thread that this language isn't supported
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
    // Fetch the message the user reacted to
    const result = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      inclusive: true,
      limit: 1,
    });

    const message = result.messages?.[0];

    // Guard: message missing or has no text field (e.g. image-only post)
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

    // Guard: bot or slash command output (e.g. /giphy puts search text in message.text)
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

    // Guard: file/image uploads
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

    // Strip Slack markup (mentions, links, entities) before translating
    const plainText = stripSlackFormatting(message.text);

    // Guard: text was entirely Slack formatting (e.g. a lone @mention)
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

    // Translate with auto-detected source language and post as a threaded reply
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
