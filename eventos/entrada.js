const { Events } = require("discord.js");
const { memberRoleId } = require("../config");
const { pegarCanal } = require("../lib/canal");
const { montarWelcome } = require("../mensagens/welcome");

function entrada(client) {
  client.on(Events.GuildMemberAdd, async (member) => {
    if (member.user.bot) return;

    const name = member.displayName;
    let roleGiven = false;

    try {
      await member.roles.add(memberRoleId, "Kyomi: cargo de Membro ao entrar");
      roleGiven = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `Não dei o cargo de Membro para ${name}. O cargo da Kyomi está acima do Membro, e ela tem Gerenciar cargos? ${message}`,
      );
    }

    try {
      const channel = await pegarCanal(member.guild);
      if (!channel) return;
      await channel.send(
        montarWelcome({
          member,
          roleGiven,
          memberCount: member.guild.memberCount,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Não consegui mandar o welcome de ${name}. ${message}`);
    }
  });
}

module.exports = entrada;
