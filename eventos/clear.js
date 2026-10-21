const {
  Events,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require("discord.js");

const MS_14_DIAS = 14 * 24 * 60 * 60 * 1000;

function clear(client) {
  client.once(Events.ClientReady, (readyClient) => {
    const data = new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Apaga as mensagens deste canal.")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false)
      .toJSON();

    for (const guild of readyClient.guilds.cache.values()) {
      guild.commands
        .fetch()
        .then(async (comandos) => {
          const atual = comandos.find((comando) => comando.name === "clear");
          if (atual) await atual.edit(data);
          else await guild.commands.create(data);
          console.log(`Comando /clear registrado em ${guild.name}.`);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`Não registrei o /clear em ${guild.name}. ${message}`);
        });
    }
  });

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== "clear") return;

    executar(interaction).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Erro no /clear. A Kyomi continua ligada. ${message}`);
    });
  });
}

async function executar(interaction) {
  if (!interaction.inGuild() || !interaction.channel || typeof interaction.channel.bulkDelete !== "function") {
    await interaction.reply({
      content: "Usa o /clear em um canal de texto do servidor.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: "Só administrador pode usar o /clear.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const me =
    interaction.guild.members.me ?? (await interaction.guild.members.fetchMe().catch(() => null));
  const perms = me ? interaction.channel.permissionsFor(me) : null;
  if (
    !perms?.has(PermissionFlagsBits.ManageMessages) ||
    !perms.has(PermissionFlagsBits.ReadMessageHistory)
  ) {
    await interaction.reply({
      content: "Eu preciso de Gerenciar mensagens e Ver histórico de mensagens neste canal.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let apagadas = 0;
  const channel = interaction.channel;

  while (true) {
    const buscadas = await channel.messages.fetch({ limit: 100 });
    if (buscadas.size === 0) break;

    const recentes = buscadas.filter(
      (message) => Date.now() - message.createdTimestamp < MS_14_DIAS,
    );
    const antigas = buscadas.filter(
      (message) => Date.now() - message.createdTimestamp >= MS_14_DIAS,
    );
    let saiu = 0;

    if (recentes.size >= 2) {
      const removidas = await channel.bulkDelete(recentes, true);
      saiu += removidas.size;
    } else if (recentes.size === 1) {
      const ok = await recentes
        .first()
        .delete()
        .then(() => true)
        .catch(() => false);
      if (ok) saiu += 1;
    }

    for (const message of antigas.values()) {
      const ok = await message
        .delete()
        .then(() => true)
        .catch(() => false);
      if (ok) saiu += 1;
    }

    apagadas += saiu;
    if (saiu === 0) break;
  }

  const texto = apagadas === 1 ? "Apaguei 1 mensagem." : `Apaguei ${apagadas} mensagens.`;
  await interaction.editReply(texto).catch(() => {});
}

module.exports = clear;
