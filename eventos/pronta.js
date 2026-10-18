const { ActivityType, Events } = require("discord.js");

function pronta(client) {
  client.once(Events.ClientReady, (readyClient) => {
    const guilds = readyClient.guilds.cache.map((guild) => guild.name).join(", ");
    console.log(`Kyomi acordou como ${readyClient.user.tag}. Servidores: ${guilds || "nenhum"}.`);
    readyClient.user.setPresence({
      status: "online",
      activities: [{ name: "Minecraft", type: ActivityType.Playing }],
    });
  });
}

module.exports = pronta;
