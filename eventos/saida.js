const { Events } = require("discord.js");
const { pegarCanal } = require("../lib/canal");
const { montarSaida } = require("../mensagens/saida");

function saida(client) {
  client.on(Events.GuildMemberRemove, async (member) => {
    if (member.user.bot) return;

    const name = member.displayName || member.user.username;

    try {
      const channel = await pegarCanal(member.guild);
      if (!channel) return;
      await channel.send(montarSaida({ name, memberCount: member.guild.memberCount }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Não consegui mandar a saída de ${name}. ${message}`);
    }
  });
}

module.exports = saida;
