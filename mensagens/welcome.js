const { EmbedBuilder } = require("discord.js");
const { rulesChannelId, helpChannelId } = require("../config");

function montarWelcome({ member, roleGiven, memberCount }) {
  const name = member.displayName;
  const avatar = member.user.displayAvatarURL({ extension: "png", size: 512 });
  const roleLine = roleGiven
    ? "O cargo de **Membro** foi atribuído a você. Já pode ficar à vontade."
    : "Eu tentei atribuir o cargo de **Membro**, mas não consegui. Chama a staff pra mim, tá?";

  const embed = new EmbedBuilder()
    .setColor(0xe7a0b8)
    .setTitle(`Bem-vindo(a), ${name}`)
    .setDescription(
      [
        "Oi. Eu sou a **Kyomi**.",
        "",
        `Que bom que você entrou, **${name}**. O servidor fica mais bonito com você aqui.`,
        "",
        roleLine,
        "",
        `Agora somos **${memberCount}** membros.`,
        "",
        `Antes de explorar, dá uma passadinha em <#${rulesChannelId}>. Se precisar de uma mão, o <#${helpChannelId}> está aberto.`,
        "",
        "Fica à vontade, tá? Estou feliz de te ver.",
      ].join("\n"),
    )
    .setThumbnail(avatar)
    .setImage(avatar)
    .setFooter({ text: "Kyomi te deu as boas-vindas" })
    .setTimestamp();

  return {
    content: `${member}`,
    embeds: [embed],
    allowedMentions: { parse: [], users: [member.id] },
  };
}

module.exports = { montarWelcome };
