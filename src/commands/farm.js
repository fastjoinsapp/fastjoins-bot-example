/**
 * /farm — pick a server in a select menu, FastJoins adds you to it with Discord's API
 * (scope guilds.join) and pays you. The Auto-farm button joins many servers in a row.
 *
 * Users allow the bot once on FastJoins (link_url). Until then, the bot falls back to
 * the invite link + "I joined" button (farm/claim).
 *
 * customId: farm:list | farm:pick:<allowed> | farm:claim:<guildId> | farm:auto | farm:go:<count> | farm:stop
 */
const { SlashCommandBuilder, StringSelectMenuBuilder } = require("discord.js");
const cards = require("../render/cards");
const { view, row, button, linkButton, ButtonStyle } = require("../ui");

const POLL_MS = 2500;
const MAX_WATCH_MS = 14 * 60 * 1000; // interaction tokens expire after 15 minutes
const watching = new Set(); // users whose auto-farm message is being updated

/* ---------- views ---------- */
const listView = async (interaction, { api, l }) => {
    const data = await api.farm(interaction.user.id);
    const file = await cards.farmList(data, l);
    const options = data.servers.slice(0, 25).map((s, i) => ({
        label: `${String(i + 1).padStart(2, "0")} · ${s.name}`.slice(0, 100),
        description: l.t("farm.option", { uses: s.uses, orders: s.orders, reward: l.num(data.reward) }).slice(0, 100),
        value: s.id
    }));
    return view(file, [
        options.length ? row(new StringSelectMenuBuilder().setCustomId(`farm:pick:${data.allowed ? 1 : 0}`).setPlaceholder(l.t("farm.select")).addOptions(options)) : null,
        row(
            button("farm:auto", l.t("farm.auto"), ButtonStyle.Primary, !data.allowed || !options.length),
            button("farm:list", l.t("farm.refresh")),
            data.allowed ? null : linkButton(data.link_url, l.t("farm.allow"))
        )
    ]);
};

const linkView = async (url, { l }) => view(await cards.linkCard(l), [
    row(linkButton(url, l.t("link.open")), button("farm:list", l.t("farm.refresh")))
]);

const afterJoinRows = (l) => [ row(button("farm:list", l.t("farm.next"), ButtonStyle.Success), button("farm:auto", l.t("farm.auto"))) ];

// Shown while waiting for FastJoins, so the click feels instant
const busyRows = (label) => [ row(new StringSelectMenuBuilder().setCustomId("farm:busy").setPlaceholder(label.slice(0, 150)).setDisabled(true).addOptions([ { label: "…", value: "busy" } ])) ];

/* ---------- auto-farm ---------- */
const autoRows = (state, l) => (state.running
    ? [ row(button("farm:stop", l.t("auto.stop"), ButtonStyle.Danger)) ]
    : [ row(button("farm:list", l.t("auto.again"), ButtonStyle.Success)) ]);

// Edits the message with the live state until the run ends, then shows the animated summary
const watch = async (interaction, { api, l }, state) => {
    const userId = interaction.user.id;
    // Another message already follows this run: just show where it is
    if(watching.has(userId)) return interaction.editReply(view(await cards.autoProgress(state, l), [ row(button("farm:list", l.t("farm.back"))) ]));
    watching.add(userId);
    const started = Date.now();
    let shown = -1;
    try {
        while(state.running && Date.now() - started < MAX_WATCH_MS) {
            if(state.done !== shown) {
                shown = state.done;
                await interaction.editReply(view(await cards.autoProgress(state, l), autoRows(state, l)));
            };
            await new Promise((r) => setTimeout(r, POLL_MS));
            state = await api.autoStatus(userId);
        };
        await interaction.editReply(view(await cards.autoDone(state, l), autoRows(state, l)));
    } finally {
        watching.delete(userId);
    };
};

/* ---------- command ---------- */
module.exports = {
    data: new SlashCommandBuilder().setName("farm").setDescription("Join servers and earn coins"),

    async execute(interaction, ctx) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await listView(interaction, ctx));
    },

    // Select menu: the user picked a server
    async select(interaction, ctx, [ action, allowed ]) {
        if(action !== "pick") return;
        const { api, l } = ctx;
        const guildId = interaction.values[0];
        const name = interaction.component.options.find((o) => o.value === guildId)?.label.replace(/^\d+ · /, "") || "";
        await interaction.update({ components: busyRows(l.t("farm.joining", { name })) });

        if(allowed !== "1") {
            // Not allowed yet: invite link + "I joined"
            const data = await api.farm(interaction.user.id);
            const server = data.servers.find((s) => s.id === guildId);
            if(!server) return interaction.editReply(await listView(interaction, ctx));
            return interaction.editReply(view(await cards.inviteCard({ server, reward: data.reward, stayDays: data.stay_days }, l), [
                row(linkButton(server.invite_url, l.t("invite.join")), button(`farm:claim:${guildId}`, l.t("invite.claim"), ButtonStyle.Success), button("farm:list", l.t("farm.back"))),
                row(linkButton(data.link_url, l.t("farm.allow")))
            ]));
        };

        try {
            const r = await api.join(interaction.user.id, guildId);
            const data = await api.farm(interaction.user.id).catch(() => ({ stay_days: 2 }));
            await interaction.editReply(view(await cards.joinResult({ guild: r.guild, coins: r.coins, balance: r.balance, stayDays: data.stay_days }, l), afterJoinRows(l)));
        } catch (err) {
            // The user revoked the bot, or the Discord authorization expired
            if(err.code === 9) return interaction.editReply(await linkView(err.details.link_url, ctx));
            await interaction.editReply(await listView(interaction, ctx)).catch(() => {});
            throw err;
        };
    },

    async button(interaction, ctx, [ action, arg ]) {
        const { api, l } = ctx;
        const userId = interaction.user.id;

        if(action === "list") {
            await interaction.deferUpdate();
            return interaction.editReply(await listView(interaction, ctx));
        };

        if(action === "claim") {
            await interaction.deferUpdate();
            const { coins, balance } = await api.claim(userId, arg);
            const [ info, data ] = await Promise.all([ api.info(arg), api.farm(userId) ]);
            return interaction.editReply(view(await cards.joinResult({ guild: info, coins, balance, stayDays: data.stay_days }, l), afterJoinRows(l)));
        };

        if(action === "auto") {
            await interaction.deferUpdate();
            // Already running (started from another message or the website)? Follow it.
            const current = await api.autoStatus(userId);
            if(current.running) return watch(interaction, ctx, current);
            const data = await api.farm(userId);
            if(!data.allowed) return interaction.editReply(await linkView(data.link_url, ctx));
            const available = data.servers.length;
            const options = [ 5, 10, 25 ].map((count) => ({ count })).concat({ count: Math.min(100, Math.max(1, available)), max: true });
            return interaction.editReply(view(await cards.autoPick({ available, reward: data.reward, balance: data.balance, options }, l), [
                row(options.map((o) => button(`farm:go:${o.count}`, o.max ? `${l.t("auto.max")} (${o.count})` : l.t("auto.start", { n: o.count }), o.max ? ButtonStyle.Primary : ButtonStyle.Secondary, !available || (!o.max && o.count > available)))),
                row(button("farm:list", l.t("farm.back")))
            ]));
        };

        if(action === "go") {
            await interaction.deferUpdate();
            try {
                const state = await api.autoStart(userId, Number(arg));
                return watch(interaction, ctx, state);
            } catch (err) {
                if(err.code === 9) return interaction.editReply(await linkView(err.details.link_url, ctx));
                throw err;
            };
        };

        if(action === "stop") {
            await interaction.deferUpdate();
            await api.autoStop(userId);
            // the watch loop sees the run end and shows the summary
        };
    }
};
