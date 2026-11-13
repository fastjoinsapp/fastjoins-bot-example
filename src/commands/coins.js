/**
 * Coin commands: /balance, /daily, /pay, /leaderboard
 * (several commands in one file: this module exports an array)
 */
const { SlashCommandBuilder } = require("discord.js");
const cards = require("../render/cards");
const { view, row, linkButton, person } = require("../ui");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("balance")
            .setDescription("Show coins and latest transactions")
            .addUserOption((o) => o.setName("user").setDescription("Another user")),
        async execute(interaction, { api, l }) {
            const target = interaction.options.getUser("user") || interaction.user;
            await interaction.deferReply({ ephemeral: true });
            const user = await api.getUser(target.id);
            await interaction.editReply(view(await cards.balanceCard({ user: person(target), coins: user.coins, level: user.level, transactions: user.transactions }, l)));
        }
    },
    {
        data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily coins"),
        async execute(interaction, { api, l }) {
            await interaction.deferReply({ ephemeral: true });
            const d = await api.daily(interaction.user.id);
            await interaction.editReply(view(await cards.dailyCard(d, l)));
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName("pay")
            .setDescription("Send coins to someone")
            .addUserOption((o) => o.setName("user").setDescription("Who receives the coins").setRequired(true))
            .addNumberOption((o) => o.setName("amount").setDescription("How many coins").setMinValue(0.01).setRequired(true)),
        async execute(interaction, { api, l }) {
            const to = interaction.options.getUser("user");
            const coins = interaction.options.getNumber("amount");
            await interaction.deferReply({ ephemeral: true });
            const r = await api.pay(interaction.user.id, to.id, coins);
            // Unless you are the API key owner, FastJoins asks the payer to confirm on the website
            const file = await cards.payCard({ from: person(interaction.user), to: person(to), coins, pending: !r.done }, l);
            await interaction.editReply(view(file, [ r.done ? null : row(linkButton(r.confirm_url, l.t("pay.confirm"))) ]));
        }
    },
    {
        data: new SlashCommandBuilder().setName("leaderboard").setDescription("Top FastJoins users"),
        async execute(interaction, { api, l, client }) {
            await interaction.deferReply();
            const all = await api.leaderboard();
            const top = all.slice(0, 10);
            // Names and avatars come from Discord (cached by discord.js after the first call)
            const rows = await Promise.all(top.map(async (u) => {
                const du = await client.users.fetch(u.id).catch(() => null);
                return { ...u, name: du ? (du.globalName || du.username) : (u.username || u.id), avatar: du?.displayAvatarURL({ extension: "png", size: 128 }) || null };
            }));
            const mine = all.find((u) => u.id === interaction.user.id);
            await interaction.editReply(view(await cards.leaderboardCard({ rows, me: mine ? { id: mine.id, rank: mine.rank } : null }, l)));
        }
    }
];
