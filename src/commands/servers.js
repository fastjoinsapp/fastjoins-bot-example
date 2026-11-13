/**
 * Server commands: /check, /buy, /info
 */
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const cards = require("../render/cards");
const { view, row, linkButton } = require("../ui");

const guildOf = (interaction) => ({
    name: interaction.guild?.name || null,
    icon: interaction.guild?.iconURL({ extension: "png", size: 128 }) || null
});

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("check")
            .setDescription("Can I leave a server without losing coins?")
            .addStringOption((o) => o.setName("server_id").setDescription("Server ID (empty = all your servers)")),
        async execute(interaction, { api, l }) {
            await interaction.deferReply({ ephemeral: true });
            const guildId = interaction.options.getString("server_id");
            if(guildId) {
                const r = await api.check(interaction.user.id, guildId);
                return interaction.editReply(view(await cards.checkCard({ single: { ...r, guildId } }, l)));
            };
            const { safe, locked } = await api.checkAll(interaction.user.id);
            await interaction.editReply(view(await cards.checkCard({ safe, locked }, l)));
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
        async execute(interaction, { api, l, config }) {
            await interaction.deferReply({ ephemeral: true });
            const guild = guildOf(interaction);
            const info = await api.info(interaction.guildId);
            if(!info.bot_in_server) {
                return interaction.editReply(view(await cards.campaignCard({ guild, campaign: null, status: "nobot" }, l), [
                    row(linkButton(`${config.baseUrl}/invite?guild_id=${interaction.guildId}`, l.t("campaign.add")))
                ]));
            };
            const coins = interaction.options.getInteger("members");
            const channel = interaction.options.getChannel("channel");
            const r = await api.buy(interaction.user.id, interaction.guildId, coins, channel?.id);
            if(r.started) {
                const after = await api.info(interaction.guildId);
                return interaction.editReply(view(await cards.campaignCard({ guild, campaign: after.campaign, status: "started", coins }, l)));
            };
            await interaction.editReply(view(await cards.campaignCard({ guild, campaign: null, status: "pending", coins }, l), [
                row(linkButton(r.confirm_url, l.t("pay.confirm")))
            ]));
        }
    },
    {
        data: new SlashCommandBuilder().setName("info").setDescription("FastJoins campaign of this server").setDMPermission(false),
        async execute(interaction, { api, l, config }) {
            await interaction.deferReply({ ephemeral: true });
            const guild = guildOf(interaction);
            const info = await api.info(interaction.guildId);
            if(!info.bot_in_server) {
                return interaction.editReply(view(await cards.campaignCard({ guild, campaign: null, status: "nobot" }, l), [
                    row(linkButton(`${config.baseUrl}/invite?guild_id=${interaction.guildId}`, l.t("campaign.add")))
                ]));
            };
            await interaction.editReply(view(await cards.campaignCard({ guild, campaign: info.campaign, status: info.campaign ? "info" : "none" }, l)));
        }
    }
];
