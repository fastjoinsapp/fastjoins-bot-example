/**
 * /help and /stats (developer earnings, owners only)
 */
const { SlashCommandBuilder } = require("discord.js");

module.exports = [
    {
        data: new SlashCommandBuilder().setName("help").setDescription("All commands"),
        async execute(interaction, { t, config }) {
            await interaction.reply({ content: t("help", { url: config.baseUrl }), ephemeral: true });
        }
    },
    {
        data: new SlashCommandBuilder().setName("stats").setDescription("Your developer earnings (owners only)"),
        async execute(interaction, { api, t, config }) {
            if(!config.owners.includes(interaction.user.id)) return interaction.reply({ content: t("ownerOnly"), ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            const s = await api.stats();
            await interaction.editReply(t("stats", {
                users: s.affiliated_users,
                users30: s.affiliated_users_30d,
                joins: s.affiliated_joins,
                earned: s.affiliation_earned,
                req: s.api_requests_30d,
                balance: s.balance
            }));
        }
    }
];
