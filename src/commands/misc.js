/**
 * /help and /stats (developer earnings, owners only)
 */
const { SlashCommandBuilder } = require("discord.js");
const cards = require("../render/cards");
const { view } = require("../ui");

module.exports = [
    {
        data: new SlashCommandBuilder().setName("help").setDescription("All commands"),
        async execute(interaction, { l, config, commands }) {
            await interaction.deferReply({ ephemeral: true });
            const list = [ ...commands.keys() ].map((name) => [ name, l.t(`help.${name}`) ]);
            await interaction.editReply(view(await cards.helpCard({ commands: list, url: config.baseUrl }, l)));
        }
    },
    {
        data: new SlashCommandBuilder().setName("stats").setDescription("Your developer earnings (owners only)"),
        async execute(interaction, { api, l, config }) {
            if(!config.owners.includes(interaction.user.id)) return interaction.reply({ content: l.t("ownerOnly"), ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply(view(await cards.statsCard(await api.stats(), l)));
        }
    }
];
