# FastJoins — example bot

An open source Discord bot built on the [FastJoins public API](https://fastjoins.fr/docs).
Fork it, plug in your API key, and run your own member-exchange bot: **every user of your bot is affiliated to you**, and you earn coins each time one of them joins a promoted server.

Every reply is an image drawn with canvas, in the colors of the FastJoins website. Joining a server, the daily reward and the end of an auto-farm are animated (GIF).

> 🇫🇷 Un bot Discord open source branché sur l'API FastJoins. Forkez-le, ajoutez votre clé API et lancez votre propre bot : chaque utilisateur vous est affilié et vous rapporte des pièces à chaque serveur rejoint. Toutes les réponses sont des images (canvas), animées quand il se passe quelque chose.

## Commands

| Command | What it does |
|---|---|
| `/farm` | Servers to join in a **select menu**: pick one, FastJoins adds you to it and pays you. **Auto-farm** joins 5, 10, 25 or all available servers in a row, with live progress |
| `/daily` | Daily reward, with a 7-day streak (animated) |
| `/balance [user]` | Coins, level and the 5 latest transactions |
| `/pay <user> <amount>` | Sends coins (the payer confirms on the website) |
| `/buy <members> [channel]` | Promotes the current server (the buyer confirms on the website) |
| `/check [server_id]` | Can I leave a server without losing coins? |
| `/info` | Campaign of the current server |
| `/leaderboard` | Top 10 with a podium |
| `/stats` | Your developer earnings (owners only) |
| `/help` | Command list |

Replies follow the language of the user's Discord client (English and French included, see `src/i18n.js`).

## How joining works

A bot can't add someone to a server by itself: Discord only allows it with the user's permission (OAuth2 scope `guilds.join`), given to FastJoins.

1. The first time, `/farm` shows an **Allow the bot** button. It opens FastJoins: the user logs in with Discord and allows **your** bot (once).
2. Then `/farm` → pick a server → `farm/join`: FastJoins adds the user with Discord's API and pays them.
3. **Auto-farm** calls `farm/auto`; the run happens on FastJoins (the user can close Discord) and the bot follows it with `farm/auto/status` to update the image.
4. Users who don't want to allow the bot can still join with the invite link and press **I joined** (`farm/claim`).

Users can revoke your bot at any time in their FastJoins settings. Leaving a server before the minimum stay costs coins: `/check` tells when it's safe.

## Setup

Requirements: **Node.js 18+**, a Discord application with a bot, and a FastJoins API key.

1. Create a bot on the [Discord Developer Portal](https://discord.com/developers/applications) and copy its token.
2. Log in on FastJoins, open **Developers** and generate an API key.
3. Configure and start:

```bash
git clone https://github.com/fastjoinsapp/fastjoins-bot-example.git
cd fastjoins-bot-example
cp .env.example .env
npm install
npm start
```

## Config **.env**

```
# Discord bot token (https://discord.com/developers/applications -> Bot -> Reset Token)
TOKEN=

# Your FastJoins API key (https://fastjoins.fr/developers). Every user of this bot is affiliated to it.
API_KEY=

# FastJoins website URL (no trailing slash)
FASTJOINS_URL=https://fastjoins.fr

# Optional: a test server ID to register slash commands instantly (empty = global, can take up to 1 hour)
GUILD_ID=

# Optional: comma-separated Discord IDs allowed to use /stats
OWNERS=
```

| Variable | Required | Description |
|---|---|---|
| `TOKEN` | yes | Your Discord bot token |
| `API_KEY` | yes | Your FastJoins API key. Users of the bot are affiliated to it |
| `FASTJOINS_URL` | yes | FastJoins website, e.g. `https://fastjoins.fr` |
| `GUILD_ID` | no | Test server: commands register instantly there (global registration can take up to 1 hour) |
| `OWNERS` | no | Comma-separated Discord IDs allowed to use `/stats` |

Invite your bot with the `bot` and `applications.commands` scopes. It only needs the **Guilds** intent.

Images are drawn with [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) (prebuilt, nothing to compile) and encoded to GIF with [`gifenc`](https://github.com/mattdesl/gifenc). The font is [Inter](https://rsms.me/inter/) (`@fontsource/inter`, OFL); names with emoji or other scripts use the system fonts.

## Project structure

```
index.js                client, command loader, interaction router (slash commands, buttons, select menus)
assets/logo.png         logo drawn on every card
src/config.js           reads and validates .env
src/api.js              FastJoins API client (auth header, timeout, errors)
src/i18n.js             translations, number and date formats
src/ui.js               reply helpers (one image + buttons)
src/render/kit.js       theme, fonts, shapes, image loading, easing
src/render/gif.js       draw function -> animated GIF
src/render/cards.js     every card the bot sends
src/commands/*.js       slash commands (a file can export several commands)
```

Add a command: create a file in `src/commands/` exporting `{ data: SlashCommandBuilder, execute(interaction, ctx) }`, and optionally `button(interaction, ctx, args)` / `select(interaction, ctx, args)` for components whose `customId` starts with the command name (`"farm:go:10"` → `args = ["go", "10"]`).

Designing a card? Set `RENDER_DEBUG=some/folder` to also save the middle and last frames of each GIF as PNG.

## License

MIT — see [LICENSE](LICENSE). The FastJoins logo in `assets/` belongs to FastJoins: replace it with yours if you rebrand the bot.
