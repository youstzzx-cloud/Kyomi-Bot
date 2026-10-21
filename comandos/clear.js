const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

const QUATORZE_DIAS = 14 * 24 * 60 * 60 * 1000;
const MAX_PAGINAS = 500;

const dados = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Apaga as mensagens deste canal.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

function ordenar(mensagens) {
  return [...mensagens.values()].sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

async function apagarUma(msg) {
  try {
    await msg.delete();
    return 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Não apaguei a mensagem ${msg.id}. ${message}`);
    return 0;
  }
}

async function apagarRecentes(channel, recentes) {
  if (recentes.length === 0) return 0;
  if (recentes.length === 1) return apagarUma(recentes[0]);
  try {
    const removidas = await channel.bulkDelete(recentes, true);
    return removidas.size;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Apagar em lote falhou, vou uma por uma. ${message}`);
    let n = 0;
    for (const msg of recentes) n += await apagarUma(msg);
    return n;
  }
}

async function apagarTudo(channel, aoProgredir) {
  let apagadas = 0;
  let before;

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
    const busca = { limit: 100 };
    if (before) busca.before = before;
    const lote = await channel.messages.fetch(busca);
    if (lote.size === 0) break;

    const lista = ordenar(lote);
    before = lista[0].id;

    const agora = Date.now();
    const recentes = [];
    const antigas = [];
    for (const msg of lista) {
      if (!msg.deletable) continue;
      if (agora - msg.createdTimestamp < QUATORZE_DIAS) recentes.push(msg);
      else antigas.push(msg);
    }

    apagadas += await apagarRecentes(channel, recentes);
    for (const msg of antigas) apagadas += await apagarUma(msg);
    if (aoProgredir) await aoProgredir(apagadas);

    if (lote.size < 100) break;
  }

  return apagadas;
}

async function executar(interaction) {
  const channel = interaction.channel;
  if (!channel || !channel.isTextBased() || channel.isDMBased() || !("messages" in channel)) {
    await interaction.reply({
      content: "O /clear só funciona num canal de texto do servidor.",
      ephemeral: true,
    });
    return;
  }

  const bot = interaction.guild.members.me ?? (await interaction.guild.members.fetchMe());
  const permsBot = channel.permissionsFor(bot);
  if (
    !permsBot?.has(PermissionFlagsBits.ManageMessages) ||
    !permsBot.has(PermissionFlagsBits.ReadMessageHistory)
  ) {
    await interaction.reply({
      content:
        "Não consigo apagar aqui. No cargo da Kyomi, liga **Gerenciar mensagens** e **Ver histórico de mensagens**. O cargo dela também não pode estar bloqueado neste canal.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    let ultimoAviso = 0;
    const total = await apagarTudo(channel, async (n) => {
      if (n - ultimoAviso < 100) return;
      ultimoAviso = n;
      await interaction.editReply(`Apagando... **${n}** mensagens até agora.`).catch(() => {});
    });
    const texto =
      total > 0
        ? `Pronto. Apaguei **${total}** mensagens neste canal.`
        : "Não achei mensagem pra apagar. Se ainda tem texto antigo na tela, me dá **Gerenciar mensagens** neste canal e usa /clear de novo.";
    await interaction.editReply(texto);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Falha no /clear. ${message}`);
    await interaction
      .editReply("Parei no meio. Confere se a Kyomi tem Gerenciar mensagens e usa /clear de novo.")
      .catch(() => {});
  }
}

module.exports = { dados, executar };
        
