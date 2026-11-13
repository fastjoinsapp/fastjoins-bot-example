/**
 * Server commands: /check, /buy, /info
 */
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("check")
            .setDescription("Can I leave a server without losing coins?")
            .addStringOption((o) => o.setName("server_id").setDescription("Server ID (empty = all your servers)")),
        async execute(interaction, { api, t }) {
            await interaction.deferReply({ ephemeral: true });
            const guildId = interaction.options.getString("server_id");
            if(guildId) {
                const r = await api.check(interaction.user.id, guildId);
                return interaction.editReply(r.can_leave ? t("checkYes") : t("checkNo", { at: Math.floor(r.safe_at / 1000) }));
            };
            const { safe, locked } = await api.checkAll(interaction.user.id);
            await interaction.editReply(t("checkAll", {
                safe: safe.map((s) => s.name).join(", ") || t("none"),
                locked: locked.map((s) => `${s.name} (<t:${Math.floor(s.safe_at / 1000)}:R>)`).join(", ") || t("none")
            }));
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName("buy")
            .setDescription("Promote this server with your coins")
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addIntegerOption((o) => o.setName("members").setDescription("Members wanted (1 coin each)").setMinValue(1).setRequired(true))
            .addChannelOption((o) => o.setName("channel").setDescription("Channel for the invite").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
        async execute(interaction, { api, t, config }) {
            await interaction.deferReply({ ephemeral: true });
            const info = await api.info(interaction.guildId);
            if(!info.bot_in_server) return interaction.editReply(t("infoNoBot", { url: `${config.baseUrl}/invite?guild_id=${interaction.guildId}` }));
            const coins = interaction.options.getInteger("members");
            const channel = interaction.options.getChannel("channel");
            const r = await api.buy(interaction.user.id, interaction.guildId, coins, channel?.id);
            await interaction.editReply(r.started ? t("buyDone", { coins }) : t("confirm", { url: r.confirm_url }));
        }
    },
    {
        data: new SlashCommandBuilder().setName("info").setDescription("FastJoins campaign of this server").setDMPermission(false),
        async execute(interaction, { api, t, config }) {
            await interaction.deferReply({ ephemeral: true });
            const info = await api.info(interaction.guildId);
            if(!info.bot_in_server) return interaction.editReply(t("infoNoBot", { url: `${config.baseUrl}/invite?guild_id=${interaction.guildId}` }));
            await interaction.editReply(info.campaign ? t("infoRun", info.campaign) : t("infoNone"));
        }
    }
];
