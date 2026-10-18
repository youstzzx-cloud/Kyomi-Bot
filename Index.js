const {
  ActivityType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
} = require("discord.js");
const http = require("http");

const TOKEN = process.env.DISCORD_TOKEN;
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID || "1561069559371272374";
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || "1561043341561565206";
const HELP_CHANNEL_ID = process.env.HELP_CHANNEL_ID || "1561344446333853746";
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || "";

if (!TOKEN) {
  console.error("Falta a variável DISCORD_TOKEN. Não coloque o token no código.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once(Events.ClientReady, (readyClient) => {
  const guilds = readyClient.guilds.cache.map((guild) => guild.name).join(", ");
  console.log(`Kyomi acordou como ${readyClient.user.tag}. Servidores: ${guilds || "nenhum"}.`);
  readyClient.user.setPresence({
    status: "online",
    activities: [{ name: "as boas-vindas", type: ActivityType.Watching }],
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.user.bot) return;

  const name = member.displayName;
  let roleGiven = false;

  try {
    await member.roles.add(MEMBER_ROLE_ID, "Kyomi: cargo de Membro ao entrar");
    roleGiven = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Não dei o cargo de Membro para ${name}. O cargo da Kyomi está acima do Membro, e ela tem Gerenciar cargos? ${message}`,
    );
  }

  try {
    const channel = await welcomeChannel(member.guild);
    if (!channel) {
      console.error(
        "Sem canal de welcome. Defina WELCOME_CHANNEL_ID ou um canal de sistema no servidor.",
      );
      return;
    }

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
          `Antes de explorar, dá uma passadinha em <#${RULES_CHANNEL_ID}>. Se precisar de uma mão, o <#${HELP_CHANNEL_ID}> está aberto.`,
          "",
          "Fica à vontade, tá? Estou feliz de te ver.",
        ].join("\n"),
      )
      .setThumbnail(avatar)
      .setImage(avatar)
      .setFooter({ text: "Kyomi te deu as boas-vindas" })
      .setTimestamp();

    await channel.send({
      content: `${member}`,
      embeds: [embed],
      allowedMentions: { parse: [], users: [member.id] },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Não consegui mandar o welcome de ${name}. ${message}`);
  }
});

async function welcomeChannel(guild) {
  if (WELCOME_CHANNEL_ID) {
    const channel =
      guild.channels.cache.get(WELCOME_CHANNEL_ID) ??
      (await guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null));
    if (channel && channel.isTextBased() && "send" in channel) return channel;
    console.error(
      `WELCOME_CHANNEL_ID ${WELCOME_CHANNEL_ID} não é um canal de texto que eu consiga usar.`,
    );
  }

  const system = guild.systemChannel;
  if (system && system.isTextBased() && "send" in system) return system;
  return null;
}

const port = Number(process.env.PORT) || 3000;
http
  .createServer((req, res) => {
    if (req.url === "/" || req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Kyomi está acordada.\n");
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Nada aqui.\n");
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`Keep-alive ouvindo na porta ${port}. O UptimeRobot pode pingar a URL.`);
  });

client.login(TOKEN).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    `Não consegui entrar. Confere o DISCORD_TOKEN. Se ele já apareceu em algum chat, gera outro. ${message}`,
  );
  process.exit(1);
});
      
