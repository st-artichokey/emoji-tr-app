/**
 * Send a DM to a Slack user.
 */
const sendDM = async (client, userId, text) => {
  const dm = await client.conversations.open({ users: userId });
  await client.chat.postMessage({ channel: dm.channel.id, text });
};

export { sendDM };
