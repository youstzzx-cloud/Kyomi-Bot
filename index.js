const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");
const config = require("./config");
const pronta = require("./eventos/pronta");
const entrada = require("./eventos/entrada");
const saida = require("./eventos/saida");
const comandos = require("./eventos/comandos");

if (!config.token) {
  console.error("Falta a variável DISCORD_TOKEN. Não coloque o token no código.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

pronta(client);
entrada(client);
saida(client);
comandos(client);

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

client.login(config.token).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    `Não consegui entrar. Confere o DISCORD_TOKEN. Se ele já apareceu em algum chat, gera outro. ${message}`,
  );
  process.exit(1);
});
