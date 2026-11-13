/**
 * Every image the bot sends. Each function returns { attachment: Buffer, name }
 * ready for `files: [...]`. Static cards are PNG, cards with motion are GIF.
 *
 * `l` is the locale helper of the interaction: { t(key, vars), num(n), rel(ts) }.
 */
const {
    ready, C, W, PAD, create, rr, box, background, text, measure, pill, bar, coin, ring, check,
    fetchImage, picture, header, balanceChip, ease, span, hexA
} = require("./kit");
const { animate } = require("./gif");

const png = async (canvas, name) => ({ attachment: await canvas.encode("png"), name: `${name}.png` });
const gif = (buffer, name) => ({ attachment: buffer, name: `${name}.gif` });
const PNG_SCALE = 2;
const GIF_SCALE = 1;

const avatarUrl = (u) => u?.avatar || null;

/* =========================================================================
   /farm — list of servers (the select menu under the image picks one)
   ========================================================================= */
const farmList = async ({ servers, balance, reward, allowed }, l) => {
    await ready;
    const shown = servers.slice(0, 6);
    const icons = await Promise.all(shown.map((s) => fetchImage(s.icon)));
    const rows = Math.max(1, Math.ceil(shown.length / 2));
    const top = 84 + (allowed ? 0 : 58);
    const cardH = 78;
    const h = top + rows * (cardH + 12) + (shown.length ? 40 : 90);
    const { canvas, ctx } = create(W, h, PNG_SCALE);

    background(ctx, W, h);
    header(ctx, l.t("farm.title"), l.t("farm.sub", { n: servers.length, reward: l.num(reward) }));
    balanceChip(ctx, l.num(balance));

    if(!allowed) {
        box(ctx, PAD, 80, W - PAD * 2, 44, { r: 10, fill: C.amberSoft, stroke: hexA(C.amber, 0.35) });
        text(ctx, l.t("farm.linkHint"), PAD + 16, 107, { size: 13, weight: 600, color: "#f3c47a", max: W - PAD * 2 - 32 });
    };

    if(!shown.length) {
        text(ctx, l.t("farm.empty"), W / 2, top + 40, { size: 17, weight: 700, align: "center" });
        text(ctx, l.t("farm.emptySub"), W / 2, top + 64, { size: 13, color: C.text3, align: "center" });
        return png(canvas, "farm");
    };

    const cw = (W - PAD * 2 - 12) / 2;
    shown.forEach((s, i) => {
        const x = PAD + (i % 2) * (cw + 12);
        const y = top + Math.floor(i / 2) * (cardH + 12);
        box(ctx, x, y, cw, cardH, { r: 12 });
        picture(ctx, icons[i], x + 14, y + 16, 46, { name: s.name, r: 13 });
        // number = position in the select menu
        text(ctx, String(i + 1).padStart(2, "0"), x + cw - 16, y + 26, { size: 11, weight: 700, color: C.text3, align: "right" });
        text(ctx, s.name, x + 74, y + 32, { size: 15, weight: 700, max: cw - 74 - 44 });
        const p = s.orders ? s.uses / s.orders : 0;
        bar(ctx, x + 74, y + 44, cw - 74 - 90, 6, p);
        text(ctx, l.t("farm.members", { uses: s.uses, orders: s.orders }), x + 74, y + 66, { size: 12, color: C.text3 });
        pill(ctx, `+${l.num(reward)}`, x + cw - 14, y + 38, { align: "right", color: C.greenText, fill: C.greenSoft, size: 12 });
    });

    text(ctx, servers.length > shown.length ? l.t("farm.more", { n: servers.length - shown.length }) : l.t("farm.pick"), PAD, h - 18, { size: 12, color: C.text3 });
    return png(canvas, "farm");
};

/* =========================================================================
   /farm — the user just joined a server (animated)
   ========================================================================= */
const joinResult = async ({ guild, coins, balance, stayDays }, l) => {
    await ready;
    const icon = await fetchImage(guild.icon);
    const h = 250;
    const from = balance - coins;
    const sparks = Array.from({ length: 7 }, (_, i) => ({ dx: (i - 3) * 16 + (i % 2 ? 5 : -5), delay: i * 0.035, r: 4 + (i % 3) }));

    const buffer = animate({
        width: W, height: h, frames: 34, fps: 25, scale: GIF_SCALE,
        draw: (ctx, t) => {
            background(ctx, W, h, { glow: null }); // gradients band in a 256-color GIF
            header(ctx, "FastJoins", l.t("join.sub"));

            // server icon pops in
            const pi = ease.outBack(span(t, 0, 0.35));
            const size = 96;
            const ix = PAD, iy = 82;
            ctx.save();
            ctx.translate(ix + size / 2, iy + size / 2);
            ctx.scale(0.6 + 0.4 * pi, 0.6 + 0.4 * pi);
            picture(ctx, icon, -size / 2, -size / 2, size, { name: guild.name, r: 26 });
            ctx.restore();

            // green badge + check
            const pb = ease.outBack(span(t, 0.28, 0.48));
            if(pb > 0) {
                const bx = ix + size - 8, by = iy + size - 8, br = 17 * pb;
                ctx.beginPath();
                ctx.arc(bx, by, br + 4, 0, Math.PI * 2);
                ctx.fillStyle = C.bg;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(bx, by, br, 0, Math.PI * 2);
                ctx.fillStyle = C.green;
                ctx.fill();
                check(ctx, bx, by, 18, span(t, 0.38, 0.62));
            };

            // title slides in
            const pt = ease.outCubic(span(t, 0.12, 0.42));
            const tx = ix + size + 28;
            ctx.globalAlpha = pt;
            text(ctx, l.t("join.done"), tx + (1 - pt) * 16, 108, { size: 13, weight: 700, color: C.greenText });
            text(ctx, guild.name, tx + (1 - pt) * 16, 134, { size: 22, weight: 800, max: W - tx - PAD - 10 });
            ctx.globalAlpha = 1;

            // amount counts up
            const pa = ease.outCubic(span(t, 0.32, 0.8));
            ctx.globalAlpha = span(t, 0.3, 0.42);
            coin(ctx, tx + 13, 166, 12);
            text(ctx, `+${l.num(Math.round(coins * pa * 100) / 100)}`, tx + 34, 176, { size: 30, weight: 800 });
            ctx.globalAlpha = 1;

            // little coins float up from the amount
            sparks.forEach((s) => {
                const p = span(t, 0.42 + s.delay, 0.95);
                if(p <= 0 || p >= 1) return;
                ctx.globalAlpha = 1 - p;
                coin(ctx, tx + 60 + s.dx, 160 - ease.outCubic(p) * 60, s.r);
            });
            ctx.globalAlpha = 1;

            // footer: balance + reminder
            const fy = h - 50;
            box(ctx, PAD, fy, W - PAD * 2, 34, { r: 10, fill: C.surface, stroke: C.border });
            const pbal = ease.inOutCubic(span(t, 0.45, 0.92));
            text(ctx, l.t("balance.label"), PAD + 14, fy + 22, { size: 12, weight: 600, color: C.text3 });
            text(ctx, l.num(Math.round((from + coins * pbal) * 100) / 100), PAD + 14 + measure(ctx, l.t("balance.label"), 12, 600) + 10, fy + 22, { size: 14, weight: 700 });
            text(ctx, l.t("join.stay", { days: stayDays }), W - PAD - 14, fy + 22, { size: 12, color: C.text3, align: "right" });
        }
    });
    return gif(buffer, "joined");
};

/* =========================================================================
   /farm — a server to join by hand (user didn't allow the bot yet)
   ========================================================================= */
const inviteCard = async ({ server, reward, stayDays }, l) => {
    await ready;
    const icon = await fetchImage(server.icon);
    const h = 244;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t("invite.title"), l.t("invite.sub"));
    picture(ctx, icon, PAD, 84, 72, { name: server.name, r: 20 });
    text(ctx, server.name, PAD + 92, 108, { size: 20, weight: 800, max: W - PAD * 2 - 200 });
    bar(ctx, PAD + 92, 122, 300, 7, server.orders ? server.uses / server.orders : 0);
    text(ctx, l.t("farm.members", { uses: server.uses, orders: server.orders }), PAD + 92, 148, { size: 12, color: C.text3 });
    pill(ctx, `+${l.num(reward)}`, W - PAD, 96, { align: "right", color: C.greenText, fill: C.greenSoft, size: 14, h: 30 });
    const steps = [ l.t("invite.s1"), l.t("invite.s2") ];
    steps.forEach((s, i) => {
        const x = PAD + i * ((W - PAD * 2) / 2);
        pill(ctx, String(i + 1), x, 176, { fill: C.accentSoft, color: C.accentText, size: 12 });
        text(ctx, s, x + 34, 193, { size: 13, color: C.text2, max: (W - PAD * 2) / 2 - 44 });
    });
    text(ctx, l.t("join.stay", { days: stayDays }), PAD, h - 18, { size: 11, color: C.text3 });
    return png(canvas, "invite");
};

/* =========================================================================
   Allow the bot (one time) — link to FastJoins
   ========================================================================= */
// `keys` picks the texts: "link" (partner bot) or "linkMain" (the FastJoins bot itself)
const linkCard = async (l, keys = "link") => {
    await ready;
    const h = 250;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t(`${keys}.title`), l.t(`${keys}.sub`));
    const steps = [ l.t(`${keys}.s1`), l.t(`${keys}.s2`), l.t(`${keys}.s3`) ];
    const cw = (W - PAD * 2 - 24) / 3;
    steps.forEach((s, i) => {
        const x = PAD + i * (cw + 12);
        box(ctx, x, 84, cw, 120, { r: 12 });
        text(ctx, String(i + 1).padStart(2, "0"), x + 16, 112, { size: 13, weight: 800, color: C.accentText });
        // two lines max
        const words = s.split(" ");
        let line = "", y = 142, lines = 0;
        for(const w of words) {
            if(measure(ctx, `${line} ${w}`.trim(), 14, 600) > cw - 32 && line) {
                text(ctx, line, x + 16, y, { size: 14, weight: 600 });
                line = w; y += 20; lines++;
                if(lines === 2) break;
            } else line = `${line} ${w}`.trim();
        };
        if(lines < 3 && line) text(ctx, line, x + 16, y, { size: 14, weight: 600, max: cw - 32 });
    });
    text(ctx, l.t(`${keys}.foot`), PAD, h - 18, { size: 12, color: C.text3 });
    return png(canvas, "link");
};

/* =========================================================================
   Auto-farm — choose how many servers
   ========================================================================= */
const autoPick = async ({ available, reward, balance, options }, l) => {
    await ready;
    const h = 236;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t("auto.title"), l.t("auto.sub", { n: available }));
    balanceChip(ctx, l.num(balance));
    const cw = (W - PAD * 2 - 36) / 4;
    options.forEach((o, i) => {
        const x = PAD + i * (cw + 12);
        const off = o.count > available && !o.max;
        ctx.globalAlpha = off ? 0.4 : 1;
        box(ctx, x, 84, cw, 100, { r: 12, fill: o.max ? C.accentSoft : C.surface, stroke: o.max ? hexA(C.accent, 0.4) : C.border });
        text(ctx, o.max ? l.t("auto.max") : String(o.count), x + 16, 116, { size: 22, weight: 800 });
        text(ctx, l.t("auto.servers", { n: Math.min(o.count, available) }), x + 16, 138, { size: 12, color: C.text3 });
        coin(ctx, x + 23, 164, 7);
        text(ctx, `+${l.num(Math.min(o.count, available) * reward)}`, x + 36, 169, { size: 14, weight: 700, color: C.greenText });
        ctx.globalAlpha = 1;
    });
    text(ctx, l.t("auto.hint"), PAD, h - 20, { size: 12, color: C.text3 });
    return png(canvas, "autofarm");
};

/* =========================================================================
   Auto-farm — live progress (PNG) and final summary (GIF)
   ========================================================================= */
const autoDraw = (ctx, state, icons, l, t, h, animated = false) => {
    const p = state.total ? state.done / state.total : 0;
    const status = state.running ? "running" : (state.stopped ? "stopped" : (state.error && state.done < state.total ? "error" : "done"));
    const color = { running: C.accent, done: C.green, stopped: C.amber, error: C.red }[status];

    background(ctx, W, h, { glow: animated ? null : color });
    header(ctx, l.t("auto.title"), l.t("auto.goal", { n: state.total }));

    // ring
    const cx = PAD + 82, cy = 170, r = 64;
    const pr = ease.outCubic(span(t, 0, 0.6));
    ring(ctx, cx, cy, r, p * pr, { width: 12, color });
    text(ctx, `${Math.round(state.done * pr)}`, cx, cy + 6, { size: 30, weight: 800, align: "center" });
    text(ctx, `/ ${state.total}`, cx, cy + 26, { size: 13, weight: 600, color: C.text3, align: "center" });

    // status + total earned
    const x = PAD + 196;
    pill(ctx, l.t(`auto.${status}`), x, 86, { color: status === "running" ? C.accentText : (status === "done" ? C.greenText : (status === "stopped" ? "#f3c47a" : "#f59aa7")), fill: hexA(color, 0.16), dot: color });
    const pc = ease.outCubic(span(t, 0.1, 0.7));
    coin(ctx, x + 14, 142, 13);
    text(ctx, `+${l.num(Math.round(state.coins * pc * 100) / 100)}`, x + 36, 153, { size: 32, weight: 800 });
    text(ctx, l.t("auto.earned"), x, 176, { size: 12, color: C.text3 });

    // last joined servers
    const last = state.joined.slice(-4).reverse();
    const lx = W - PAD - 250;
    if(last.length) text(ctx, l.t("auto.last"), lx, 98, { size: 11, weight: 700, color: C.text3 });
    last.forEach((g, i) => {
        const pi = ease.outCubic(span(t, 0.2 + i * 0.1, 0.55 + i * 0.1));
        const y = 110 + i * 40;
        ctx.globalAlpha = pi;
        box(ctx, lx + (1 - pi) * 12, y, 250, 34, { r: 9, fill: C.surface, stroke: C.border });
        picture(ctx, icons[g.id], lx + 7 + (1 - pi) * 12, y + 5, 24, { name: g.name, r: 7 });
        text(ctx, g.name, lx + 40 + (1 - pi) * 12, y + 22, { size: 13, weight: 600, max: 150 });
        text(ctx, `+${l.num(g.coins)}`, lx + 240, y + 22, { size: 12, weight: 700, color: C.greenText, align: "right" });
    });
    ctx.globalAlpha = 1;

    if(state.error) text(ctx, state.error, x, h - 22, { size: 12, color: "#f59aa7", max: lx - x - 16 });
    else if(state.running) text(ctx, l.t("auto.closeOk"), x, h - 22, { size: 12, color: C.text3, max: lx - x - 16 });
};

const autoIcons = async (state) => {
    const icons = {};
    await Promise.all(state.joined.slice(-4).map(async (g) => (icons[g.id] = await fetchImage(g.icon))));
    return icons;
};

const autoProgress = async (state, l) => {
    await ready;
    const h = 290;
    const icons = await autoIcons(state);
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    autoDraw(ctx, state, icons, l, 1, h);
    return png(canvas, `autofarm-${state.done}`);
};

const autoDone = async (state, l) => {
    await ready;
    const h = 290;
    const icons = await autoIcons(state);
    return gif(animate({ width: W, height: h, frames: 36, fps: 25, scale: GIF_SCALE, draw: (ctx, t) => autoDraw(ctx, state, icons, l, t, h, true) }), "autofarm-done");
};

/* =========================================================================
   /balance
   ========================================================================= */
const balanceCard = async ({ user, coins, level, transactions }, l) => {
    await ready;
    const avatar = await fetchImage(avatarUrl(user));
    const rows = transactions.slice(0, 5);
    const h = 104 + Math.max(4, rows.length) * 42 + 24;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h, { glow: C.coin });
    header(ctx, l.t("balance.title"), user.name);

    // left: who + how much
    const lw = 260;
    box(ctx, PAD, 80, lw, h - 80 - PAD, { r: 14 });
    picture(ctx, avatar, PAD + 20, 100, 60, { round: true, name: user.name });
    text(ctx, user.name, PAD + 94, 124, { size: 17, weight: 700, max: lw - 110 });
    pill(ctx, l.t("balance.level", { n: level }), PAD + 94, 134, { size: 11, h: 22, fill: C.accentSoft, color: C.accentText });
    text(ctx, l.t("balance.label"), PAD + 20, h - PAD - 64, { size: 12, weight: 600, color: C.text3 });
    coin(ctx, PAD + 34, h - PAD - 34, 13);
    text(ctx, l.num(coins), PAD + 56, h - PAD - 22, { size: 34, weight: 800, max: lw - 76 });

    // right: last transactions
    const x = PAD + lw + 16;
    const rw = W - PAD - x;
    text(ctx, l.t("balance.last"), x, 98, { size: 11, weight: 700, color: C.text3 });
    if(!rows.length) text(ctx, l.t("balance.none"), x, 132, { size: 14, color: C.text2 });
    rows.forEach((tx, i) => {
        const y = 110 + i * 42;
        const credit = tx.type === "credit";
        box(ctx, x, y, rw, 36, { r: 9, fill: C.surface, stroke: C.border });
        ctx.beginPath();
        ctx.arc(x + 18, y + 18, 4, 0, Math.PI * 2);
        ctx.fillStyle = credit ? C.green : C.red;
        ctx.fill();
        text(ctx, l.reason(tx.reason), x + 32, y + 23, { size: 13, weight: 600, max: rw - 200 });
        text(ctx, l.rel(tx.date), x + rw - 92, y + 23, { size: 12, color: C.text3, align: "right" });
        text(ctx, `${credit ? "+" : "−"}${l.num(tx.amount)}`, x + rw - 14, y + 23, { size: 14, weight: 700, color: credit ? C.greenText : "#f59aa7", align: "right" });
    });
    return png(canvas, "balance");
};

/* =========================================================================
   /daily — claimed (animated) or not yet (static)
   ========================================================================= */
const streakDots = (ctx, x, y, streak, p, l) => {
    const n = 7;
    const filled = ((streak - 1) % n) + 1;
    for(let i = 0; i < n; i++) {
        const cx = x + i * 46;
        const on = i < filled;
        const pi = on ? ease.outBack(span(p, i / n * 0.6, i / n * 0.6 + 0.35)) : 0;
        box(ctx, cx, y, 38, 38, { r: 10, fill: C.surface, stroke: C.border });
        if(pi > 0) {
            ctx.save();
            ctx.translate(cx + 19, y + 19);
            ctx.scale(pi, pi);
            coin(ctx, 0, 0, 10);
            ctx.restore();
        };
        text(ctx, l.t("daily.day", { n: i + 1 }), cx + 19, y + 54, { size: 10, weight: 600, color: on ? C.text2 : C.text3, align: "center" });
    };
};

const dailyCard = async ({ amount, streak, next_at, claimed }, l) => {
    await ready;
    const h = 236;
    const draw = (ctx, t) => {
        background(ctx, W, h, { glow: claimed ? null : C.coin });
        header(ctx, l.t("daily.title"), claimed ? l.t("daily.claimed") : l.t("daily.wait", { when: l.rel(next_at) }));

        // big coin drops and bounces
        const cx = PAD + 62, cy = 140;
        const pd = claimed ? ease.outBack(span(t, 0, 0.4)) : 1;
        ctx.save();
        ctx.globalAlpha = claimed ? Math.min(1, span(t, 0, 0.12) * 2) : 0.35;
        ctx.translate(cx, cy - (1 - pd) * 70);
        coin(ctx, 0, 0, 42);
        ctx.restore();
        if(!claimed) ring(ctx, cx, cy, 54, 1 - Math.max(0, next_at - Date.now()) / 864e5, { width: 5, color: C.coin });

        const pa = claimed ? ease.outCubic(span(t, 0.2, 0.7)) : 1;
        text(ctx, claimed ? `+${l.num(Math.round(amount * pa * 100) / 100)}` : l.t("daily.soon"), PAD + 130, 136, { size: 30, weight: 800 });
        text(ctx, l.t("daily.streak", { n: streak }), PAD + 130, 160, { size: 13, color: C.text2 });

        streakDots(ctx, W - PAD - 7 * 46 + 8, 104, Math.max(1, streak), claimed ? span(t, 0.3, 1) : 1, l);
    };
    if(!claimed) {
        const { canvas, ctx } = create(W, h, PNG_SCALE);
        draw(ctx, 1);
        return png(canvas, "daily");
    };
    return gif(animate({ width: W, height: h, frames: 34, fps: 25, scale: GIF_SCALE, draw }), "daily");
};

/* =========================================================================
   /pay
   ========================================================================= */
const payCard = async ({ from, to, coins, pending }, l) => {
    await ready;
    const [ a, b ] = await Promise.all([ fetchImage(avatarUrl(from)), fetchImage(avatarUrl(to)) ]);
    const h = 240;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h, { glow: pending ? C.amber : C.green });
    header(ctx, l.t("pay.title"), pending ? l.t("pay.pending") : l.t("pay.done"));

    const person = (img, u, x) => {
        picture(ctx, img, x - 30, 86, 60, { round: true, name: u.name });
        text(ctx, u.name, x, 168, { size: 14, weight: 700, align: "center", max: 180 });
    };
    person(a, from, PAD + 110);
    person(b, to, W - PAD - 110);

    // dashed line with the amount in the middle
    ctx.setLineDash([ 5, 6 ]);
    ctx.strokeStyle = C.borderStrong;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD + 170, 116);
    ctx.lineTo(W - PAD - 170, 116);
    ctx.stroke();
    ctx.setLineDash([]);
    const label = l.num(coins);
    const tw = measure(ctx, label, 18, 800) + 52;
    box(ctx, W / 2 - tw / 2, 98, tw, 36, { r: 18, fill: C.surface2, stroke: C.borderStrong });
    coin(ctx, W / 2 - tw / 2 + 20, 116, 8);
    text(ctx, label, W / 2 - tw / 2 + 36, 123, { size: 18, weight: 800 });

    const chip = pending ? l.t("pay.pendingChip") : l.t("pay.doneChip");
    const chipW = measure(ctx, chip, 12, 600) + 32; // same maths as pill() with a dot
    pill(ctx, chip, W / 2 - chipW / 2, 186, { color: pending ? "#f3c47a" : C.greenText, fill: pending ? C.amberSoft : C.greenSoft, dot: pending ? C.amber : C.green });
    return png(canvas, "pay");
};

/* =========================================================================
   /buy and /info — a server and its campaign
   ========================================================================= */
const campaignCard = async ({ guild, campaign, status, coins }, l) => {
    await ready;
    const icon = await fetchImage(guild.icon);
    const h = coins ? 226 : 196;
    const tone = { started: C.green, pending: C.amber, info: C.accent, none: C.text3, nobot: C.red }[status];
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h, { glow: tone === C.text3 ? C.accent : tone });
    header(ctx, l.t(`campaign.${status}`), l.t(`campaign.${status}Sub`, { coins }));

    picture(ctx, icon, PAD, 84, 76, { name: guild.name, r: 22 });
    text(ctx, guild.name || "—", PAD + 96, 112, { size: 21, weight: 800, max: W - PAD * 2 - 110 });

    if(campaign) {
        const p = campaign.orders ? campaign.uses / campaign.orders : 0;
        bar(ctx, PAD + 96, 128, W - PAD * 2 - 96, 10, p, { color: tone === C.text3 ? C.accent : tone });
        text(ctx, l.t("farm.members", { uses: campaign.uses, orders: campaign.orders }), PAD + 96, 160, { size: 13, color: C.text2 });
        text(ctx, `${Math.round(p * 100)} %`, W - PAD, 160, { size: 13, weight: 700, align: "right" });
    } else {
        text(ctx, status === "nobot" ? l.t("campaign.nobotHint") : (status === "pending" ? l.t("campaign.pendingHint") : l.t("campaign.noneHint")), PAD + 96, 138, { size: 13, color: C.text2, max: W - PAD * 2 - 110 });
    };
    if(coins) {
        coin(ctx, PAD + 8, h - 26, 8);
        text(ctx, l.t("campaign.cost", { coins: l.num(coins) }), PAD + 24, h - 21, { size: 12, color: C.text3 });
    };
    return png(canvas, "campaign");
};

/* =========================================================================
   /check
   ========================================================================= */
const checkCard = async ({ single, safe = [], locked = [] }, l) => {
    await ready;
    if(single) {
        const h = 190;
        const { canvas, ctx } = create(W, h, PNG_SCALE);
        const ok = single.can_leave;
        background(ctx, W, h, { glow: ok ? C.green : C.amber });
        header(ctx, l.t("check.title"), single.guildId);
        ctx.beginPath();
        ctx.arc(PAD + 34, 124, 34, 0, Math.PI * 2);
        ctx.fillStyle = ok ? C.greenSoft : C.amberSoft;
        ctx.fill();
        if(ok) check(ctx, PAD + 34, 124, 34, 1, C.greenText);
        else ring(ctx, PAD + 34, 124, 18, 0.7, { width: 4, color: C.amber, track: "rgba(0,0,0,0)" });
        text(ctx, ok ? l.t("check.yes") : l.t("check.no"), PAD + 88, 120, { size: 20, weight: 800, max: W - PAD * 2 - 100 });
        text(ctx, ok ? l.t("check.yesSub") : l.t("check.noSub", { when: l.rel(single.safe_at) }), PAD + 88, 144, { size: 13, color: C.text2 });
        return png(canvas, "check");
    };

    const rows = Math.max(1, Math.min(6, Math.max(safe.length, locked.length)));
    const h = 104 + rows * 42 + 30;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t("check.title"), l.t("check.allSub", { safe: safe.length, locked: locked.length }));
    const cw = (W - PAD * 2 - 16) / 2;
    [ [ safe, l.t("check.safe"), C.green ], [ locked, l.t("check.locked"), C.amber ] ].forEach(([ list, title, color ], col) => {
        const x = PAD + col * (cw + 16);
        pill(ctx, `${title} · ${list.length}`, x, 80, { color: col ? "#f3c47a" : C.greenText, fill: hexA(color, 0.15), dot: color });
        if(!list.length) text(ctx, "—", x + 4, 136, { size: 14, color: C.text3 });
        list.slice(0, 6).forEach((g, i) => {
            const y = 114 + i * 42;
            box(ctx, x, y, cw, 36, { r: 9 });
            text(ctx, g.name || g.guild_id, x + 14, y + 23, { size: 13, weight: 600, max: cw - (col ? 130 : 28) });
            if(col) text(ctx, l.rel(g.safe_at), x + cw - 14, y + 23, { size: 12, color: "#f3c47a", align: "right" });
        });
    });
    if(safe.length > 6 || locked.length > 6) text(ctx, l.t("check.more"), PAD, h - 14, { size: 11, color: C.text3 });
    return png(canvas, "check");
};

/* =========================================================================
   /leaderboard
   ========================================================================= */
const leaderboardCard = async ({ rows, me }, l) => {
    await ready;
    const imgs = await Promise.all(rows.map((r) => fetchImage(r.avatar)));
    const rest = rows.slice(3, 10);
    const h = 270 + rest.length * 40 + 16;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h, { glow: C.coin });
    header(ctx, l.t("top.title"), me ? l.t("top.me", { rank: me.rank }) : l.t("top.sub"));

    // podium: 2nd, 1st, 3rd
    const medal = [ "#e5a23a", "#b8c0cc", "#c98a5a" ];
    const slots = [ [ 1, W / 2 - 200, 112, 56 ], [ 0, W / 2, 92, 72 ], [ 2, W / 2 + 200, 112, 56 ] ];
    slots.forEach(([ i, cx, y, size ]) => {
        const r = rows[i];
        if(!r) return;
        box(ctx, cx - 80, y + size / 2, 160, 244 - y - size / 2, { r: 14, fill: hexA(medal[i], 0.08), stroke: hexA(medal[i], 0.3) });
        ctx.beginPath();
        ctx.arc(cx, y + size / 2, size / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = medal[i];
        ctx.fill();
        picture(ctx, imgs[i], cx - size / 2, y, size, { round: true, name: r.name });
        pill(ctx, String(i + 1), cx - 12, y + size - 8, { fill: medal[i], color: "#111", size: 12, h: 22 });
        text(ctx, r.name, cx, y + size + 34, { size: 14, weight: 700, align: "center", max: 140 });
        const vw = measure(ctx, l.num(r.coins), 14, 700);
        coin(ctx, cx - (vw + 18) / 2 + 6, y + size + 52, 6);
        text(ctx, l.num(r.coins), cx - (vw + 18) / 2 + 18, y + size + 57, { size: 14, weight: 700, color: C.text2 });
    });

    rest.forEach((r, i) => {
        const y = 262 + i * 40;
        const mine = me && r.id === me.id;
        box(ctx, PAD, y, W - PAD * 2, 34, { r: 9, fill: mine ? C.accentSoft : C.surface, stroke: mine ? hexA(C.accent, 0.4) : C.border });
        text(ctx, String(r.rank), PAD + 22, y + 22, { size: 13, weight: 800, color: C.text3, align: "center" });
        picture(ctx, imgs[i + 3], PAD + 44, y + 5, 24, { round: true, name: r.name });
        text(ctx, r.name, PAD + 78, y + 22, { size: 14, weight: 600, max: 400 });
        text(ctx, l.num(r.coins), W - PAD - 14, y + 22, { size: 14, weight: 700, align: "right" });
    });
    return png(canvas, "leaderboard");
};

/* =========================================================================
   /stats (bot owner)
   ========================================================================= */
const statsCard = async (s, l) => {
    await ready;
    const h = 214;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t("stats.title"), l.t("stats.sub"));
    balanceChip(ctx, l.num(s.balance));
    const tiles = [
        [ l.t("stats.users"), l.num(s.affiliated_users), l.t("stats.users30", { n: s.affiliated_users_30d }) ],
        [ l.t("stats.joins"), l.num(s.affiliated_joins), "" ],
        [ l.t("stats.earned"), l.num(s.affiliation_earned), "coin" ],
        [ l.t("stats.requests"), l.num(s.api_requests_30d), l.t("stats.total", { n: l.num(s.api_requests_total) }) ]
    ];
    const cw = (W - PAD * 2 - 36) / 4;
    tiles.forEach(([ label, value, sub ], i) => {
        const x = PAD + i * (cw + 12);
        box(ctx, x, 82, cw, 100, { r: 12 });
        text(ctx, label, x + 16, 106, { size: 12, weight: 600, color: C.text3, max: cw - 32 });
        if(sub === "coin") {
            coin(ctx, x + 27, 136, 11);
            text(ctx, value, x + 46, 146, { size: 26, weight: 800, max: cw - 60 });
        } else {
            text(ctx, value, x + 16, 146, { size: 26, weight: 800, max: cw - 32 });
            if(sub) text(ctx, sub, x + 16, 168, { size: 11, color: C.greenText, max: cw - 32 });
        };
    });
    return png(canvas, "stats");
};

/* =========================================================================
   /help
   ========================================================================= */
const helpCard = async ({ commands, url }, l) => {
    await ready;
    const rows = Math.ceil(commands.length / 2);
    const h = 90 + rows * 62 + 40;
    const { canvas, ctx } = create(W, h, PNG_SCALE);
    background(ctx, W, h);
    header(ctx, l.t("help.title"), l.t("help.sub"));
    const cw = (W - PAD * 2 - 12) / 2;
    commands.forEach(([ name, desc ], i) => {
        const x = PAD + (i % 2) * (cw + 12);
        const y = 80 + Math.floor(i / 2) * 62;
        box(ctx, x, y, cw, 52, { r: 10 });
        const w = pill(ctx, `/${name}`, x + 12, y + 14, { fill: C.accentSoft, color: C.accentText, size: 12 });
        text(ctx, desc, x + 22 + w, y + 31, { size: 13, color: C.text2, max: cw - w - 34 });
    });
    text(ctx, l.t("help.foot", { url }), PAD, h - 18, { size: 12, color: C.text3 });
    return png(canvas, "help");
};

module.exports = {
    farmList, joinResult, inviteCard, linkCard, autoPick, autoProgress, autoDone,
    balanceCard, dailyCard, payCard, campaignCard, checkCard, leaderboardCard, statsCard, helpCard
};
