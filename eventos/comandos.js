const { Events } = require("discord.js");
const { dados, executar } = require("../comandos/clear");

async function registrar(guild) {
  try {
    await guild.commands.set([dados]);
    console.log(`Comando /clear registrado em ${guild.name}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Não registrei /clear em ${guild.name}. O convite da Kyomi precisa do scope applications.commands. ${message}`,
    );
  }
}

function comandos(client) {
  client.once(Events.ClientReady, async (readyClient) => {
    for (const guild of readyClient.guilds.cache.values()) {
      await registrar(guild);
    }
  });

  client.on(Events.GuildCreate, (guild) => {
    registrar(guild);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "clear") return;
    try {
      await executar(interaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Erro ao executar /clear. ${message}`);
    }
  });
}

module.exports = comandos;
