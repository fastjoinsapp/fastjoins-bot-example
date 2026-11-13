/**
 * FastJoins example bot — https://github.com/fastjoinsapp/fastjoins-bot-example (MIT)
 * Every user of this bot is affiliated to your API key: you earn coins each time they join a server.
 */
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events, REST, Routes } = require("discord.js");
const config = require("./src/config");
const api = require("./src/api");
const { t } = require("./src/i18n");

// Load every command module (a module can export one command or an array of commands)
const commands = new Map();
for(const file of fs.readdirSync(path.join(__dirname, "src/commands")).filter((f) => f.endsWith(".js"))) {
    const mod = require(`./src/commands/${file}`);
    for(const cmd of [].concat(mod)) commands.set(cmd.data.name, cmd);
};

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.once(Events.ClientReady, async (c) => {
    const rest = new REST().setToken(config.token);
    const body = [ ...commands.values() ].map((cmd) => cmd.data.toJSON());
    const route = config.guildId ? Routes.applicationGuildCommands(c.user.id, config.guildId) : Routes.applicationCommands(c.user.id);
    await rest.put(route, { body });
    console.log(`Logged in as ${c.user.tag} — ${body.length} commands registered ${config.guildId ? "on the test server" : "globally"}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    const ctx = { api, config, client, t: (key, vars) => t(interaction.locale, key, vars) };
    try {
        if(interaction.isChatInputCommand()) {
            const cmd = commands.get(interaction.commandName);
            if(cmd) await cmd.execute(interaction, ctx);
        } else if(interaction.isButton()) {
            // customId format: "<command>:<args...>"
            const [ name, ...args ] = interaction.customId.split(":");
            const cmd = commands.get(name);
            if(cmd?.button) await cmd.button(interaction, ctx, args);
        };
    } catch (err) {
        if(!(err instanceof api.ApiError)) console.error(err);
        const content = ctx.t("error", { message: err.message });
        if(interaction.deferred || interaction.replied) await interaction.followUp({ content, ephemeral: true }).catch(() => {});
        else await interaction.reply({ content, ephemeral: true }).catch(() => {});
    };
});

client.login(config.token);
