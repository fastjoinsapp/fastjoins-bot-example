const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Shows one server at a time, with Join (invite link), "I joined" (claim) and Next buttons
const render = async (interaction, { api, t, config }, index = 0) => {
    const { servers, reward, stay_days } = await api.farm(interaction.user.id);
    if(!servers.length) return { content: t("farmEmpty"), embeds: [], components: [] };

    const i = index % servers.length;
    const s = servers[i];
    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle(t("farmTitle", { reward }))
        .setDescription(`**${s.name}**\n${t("progress", { uses: s.uses, orders: s.orders })}\n\n${t("farmDesc", { days: stay_days })}`)
        .setFooter({ text: `${i + 1} / ${servers.length}` });
    if(s.icon) embed.setThumbnail(s.icon);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(t("farmJoin")).setURL(s.invite_url),
        new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(t("farmClaim")).setCustomId(`farm:claim:${s.id}:${i}`),
        new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel(t("farmNext")).setCustomId(`farm:next:${i + 1}`)
    );
    return { content: "", embeds: [ embed ], components: [ row ] };
};

module.exports = {
    data: new SlashCommandBuilder().setName("farm").setDescription("Join servers and earn coins"),

    async execute(interaction, ctx) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await render(interaction, ctx));
    },

    // customId: farm:claim:<guildId>:<index> | farm:next:<index>
    async button(interaction, ctx, [ action, a, b ]) {
        if(action === "next") {
            await interaction.deferUpdate();
            return interaction.editReply(await render(interaction, ctx, Number(a) || 0));
        };
        if(action === "claim") {
            await interaction.deferReply({ ephemeral: true });
            const { coins, balance } = await ctx.api.claim(interaction.user.id, a);
            await interaction.editReply(ctx.t("claimed", { coins, balance }));
            // Move the farm message on to the next server
            await interaction.message.edit(await render(interaction, ctx, Number(b) || 0)).catch(() => {});
        };
    }
};
