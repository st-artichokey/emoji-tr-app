/**
 * Opens a DM conversation with a user and sends them a message.
 * @param {object} client - Slack Web API client.
 * @param {string} userId - The Slack user ID to DM.
 * @param {string} text - The message text to send.
 */
const sendDM = async (client, userId, text) => {
  const dm = await client.conversations.open({ users: userId });
  await client.chat.postMessage({ channel: dm.channel.id, text });
};

export { sendDM };
