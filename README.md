# FastJoins — example bot

An open source Discord bot built on the [FastJoins public API](https://fastjoins.xyz/docs).
Fork it, plug in your API key, and run your own member-exchange bot: **every user of your bot is affiliated to you**, and you earn coins each time one of them joins a promoted server.

> 🇫🇷 Un bot Discord open source branché sur l'API FastJoins. Forkez-le, ajoutez votre clé API et lancez votre propre bot : chaque utilisateur vous est affilié et vous rapporte des pièces à chaque serveur rejoint.

## Commands

| Command | What it does |
|---|---|
| `/farm` | Shows a server to join, with **Join**, **I joined** (claims the coins) and **Next** buttons |
| `/daily` | Daily reward, with a streak |
| `/balance [user]` | Coins and the 5 latest transactions |
| `/pay <user> <amount>` | Sends coins (the payer confirms on the website) |
| `/buy <members> [channel]` | Promotes the current server (the buyer confirms on the website) |
| `/check [server_id]` | Can I leave a server without losing coins? |
| `/info` | Campaign of the current server |
| `/leaderboard` | Top 10 users |
| `/stats` | Your developer earnings (owners only) |
| `/help` | Command list |

Replies follow the language of the user's Discord client (English and French included, see `src/i18n.js`).

## Setup

Requirements: **Node.js 18+**, a Discord application with a bot, and a FastJoins API key.

1. Create a bot on the [Discord Developer Portal](https://discord.com/developers/applications) and copy its token.
2. Log in on FastJoins, open **Developers** and generate an API key.
3. Configure and start:

```bash
git clone https://github.com/fastjoins/fastjoins-bot-example.git
cd fastjoins-bot-example
cp .env.example .env
npm install
npm start
```

| Variable | Required | Description |
|---|---|---|
| `TOKEN` | yes | Your Discord bot token |
| `API_KEY` | yes | Your FastJoins API key. Users of the bot are affiliated to it |
| `FASTJOINS_URL` | yes | FastJoins website, e.g. `https://fastjoins.xyz` |
| `GUILD_ID` | no | Test server: commands register instantly there (global registration can take up to 1 hour) |
| `OWNERS` | no | Comma-separated Discord IDs allowed to use `/stats` |

Invite your bot with the `bot` and `applications.commands` scopes. It only needs the **Guilds** intent: joining is done with invite links, then verified by FastJoins.

## How farming works

1. `/farm` calls `farm` and shows a server with its invite link.
2. The user joins with the link.
3. **I joined** calls `farm/claim`: FastJoins checks with its own bot that the user really arrived, then pays them.
4. Leaving before the minimum stay costs coins: `/check` tells when it's safe.

## Project structure

```
index.js              client, command loader, interaction router
src/config.js         reads and validates .env
src/api.js            FastJoins API client (auth header, timeout, errors)
src/i18n.js           translations
src/commands/*.js     slash commands (a file can export several commands)
```

Add a command: create a file in `src/commands/` exporting `{ data: SlashCommandBuilder, execute(interaction, ctx) }` (and optionally `button(interaction, ctx, args)` for buttons whose `customId` starts with the command name).

## License

MIT — see [LICENSE](LICENSE).
