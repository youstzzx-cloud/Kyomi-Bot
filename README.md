# Kyomi

Pastas:

- `index.js` liga tudo.
- `config.js` guarda os IDs. O welcome já está em `1561129167351980183`.
- `eventos/` é o que acontece: acordar, alguém entrar, alguém sair.
- `mensagens/` é o texto do welcome e da saída.
- `lib/canal.js` acha o canal do welcome.

Quando alguém entra, a Kyomi dá o cargo de **Membro** (`1561069559371272374`), manda o welcome com a foto, menciona regras (`1561043341561565206`) e ajuda (`1561344446333853746`) e diz quantos membros o servidor tem.

Quando alguém sai, ela manda uma mensagem curta no mesmo canal: ficou triste, e de novo a contagem de membros.

O token **não** fica neste repositório. Só na variável `DISCORD_TOKEN` do Render.

## Antes de ligar

1. No [Discord Developer Portal](https://discord.com/developers/applications), abre a aplicação da Kyomi → **Bot** → **Reset Token**. O token antigo foi colado num chat e não pode mais ser usado.
2. Na mesma página, liga **Server Members Intent**. Sem isso ela não vê quem entra nem quem sai.
3. Em **OAuth2 → URL Generator**, marca o scope `bot` e as permissões **View Channels**, **Send Messages**, **Embed Links**, **Read Message History** e **Manage Roles**. Convida ela com esse link.
4. Em **Configurações do servidor → Cargos**, coloca o cargo da Kyomi **acima** do cargo Membro.

## Variáveis

| Variável | Obrigatória | Padrão |
| --- | --- | --- |
| `DISCORD_TOKEN` | sim | nenhum |
| `WELCOME_CHANNEL_ID` | não | `1561129167351980183` |
| `MEMBER_ROLE_ID` | não | `1561069559371272374` |
| `RULES_CHANNEL_ID` | não | `1561043341561565206` |
| `HELP_CHANNEL_ID` | não | `1561344446333853746` |

## GitHub + Render + UptimeRobot

1. Sobe a pasta inteira da bot, com `eventos/`, `mensagens/` e `lib/`.
2. No Render, **Web Service**. Build: `npm install`. Start: `npm start`.
3. Em Environment, só `DISCORD_TOKEN` com o token novo. O ID do welcome já está no `config.js`.
4. No UptimeRobot, monitor HTTP na URL do Render, a cada 5 minutos.
