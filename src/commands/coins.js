/**
 * Coin commands: /balance, /daily, /pay, /leaderboard
 * (several commands in one file: this module exports an array)
 */
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("balance")
            .setDescription("Show coins and latest transactions")
            .addUserOption((o) => o.setName("user").setDescription("Another user")),
        async execute(interaction, { api, t, config }) {
            const target = interaction.options.getUser("user") || interaction.user;
            await interaction.deferReply({ ephemeral: true });
            const user = await api.getUser(target.id);
            const lines = user.transactions.slice(0, 5).map((tx) => `${tx.type === "credit" ? "+" : "−"}${tx.amount} · <t:${Math.floor(tx.date / 1000)}:R>`);
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(t("balance", { user: target.username, coins: user.coins }))
                .addFields({ name: t("lastTx"), value: lines.join("\n") || t("noTx") });
            await interaction.editReply({ embeds: [ embed ] });
        }
    },
    {
        data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily coins"),
        async execute(interaction, { api, t }) {
            await interaction.deferReply({ ephemeral: true });
            const d = await api.daily(interaction.user.id);
            await interaction.editReply(d.claimed
                ? t("dailyOk", { amount: d.amount, streak: d.streak })
                : t("dailyWait", { at: Math.floor(d.next_at / 1000) }));
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName("pay")
            .setDescription("Send coins to someone")
            .addUserOption((o) => o.setName("user").setDescription("Who receives the coins").setRequired(true))
            .addNumberOption((o) => o.setName("amount").setDescription("How many coins").setMinValue(0.01).setRequired(true)),
        async execute(interaction, { api, t }) {
            const to = interaction.options.getUser("user");
            const coins = interaction.options.getNumber("amount");
            await interaction.deferReply({ ephemeral: true });
            const r = await api.pay(interaction.user.id, to.id, coins);
            // Unless you are the API key owner, FastJoins asks the payer to confirm on the website
            await interaction.editReply(r.done ? t("payDone", { coins, to: `<@${to.id}>` }) : t("confirm", { url: r.confirm_url }));
        }
    },
    {
        data: new SlashCommandBuilder().setName("leaderboard").setDescription("Top FastJoins users"),
        async execute(interaction, { api, t, config }) {
            await interaction.deferReply();
            const top = (await api.leaderboard()).slice(0, 10);
            const embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle(t("top"))
                .setDescription(top.map((u) => `**${u.rank}.** ${u.username || u.id} — ${u.coins}`).join("\n") || "—");
            await interaction.editReply({ embeds: [ embed ] });
        }
    }
];
