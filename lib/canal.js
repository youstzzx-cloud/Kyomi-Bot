const { welcomeChannelId } = require("../config");

async function pegarCanal(guild) {
  const channel =
    guild.channels.cache.get(welcomeChannelId) ??
    (await guild.channels.fetch(welcomeChannelId).catch(() => null));

  if (channel && channel.isTextBased() && "send" in channel) return channel;

  console.error(
    `Não achei o canal ${welcomeChannelId}. Confere se a Kyomi consegue ver e escrever nele.`,
  );
  return null;
}

module.exports = { pegarCanal };
