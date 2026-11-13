/**
 * Drawing kit shared by every card: theme, fonts, shapes, images and easing.
 * Cards are drawn in "logical" pixels (width 760) and exported at a higher scale.
 */
const path = require("path");
const { createCanvas, GlobalFonts, loadImage } = require("@napi-rs/canvas");

/* ---------- fonts ---------- */
const fontDir = path.join(path.dirname(require.resolve("@fontsource/inter/package.json")), "files");
for(const weight of [ 400, 500, 600, 700, 800 ]) {
    GlobalFonts.registerFromPath(path.join(fontDir, `inter-latin-${weight}-normal.woff2`), "Inter");
};
// System fonts catch what Inter can't draw (emoji, CJK… in server and user names)
const FAMILY = "Inter, \"Segoe UI\", \"Noto Sans\", \"Noto Color Emoji\", \"Apple Color Emoji\", sans-serif";
const font = (size, weight = 500) => `${weight} ${size}px ${FAMILY}`;

/* ---------- theme (same palette as the website) ---------- */
const C = {
    bg: "#101217", raised: "#15181e", surface: "#191c23", surface2: "#20242c", surface3: "#282c36",
    border: "#252932", borderStrong: "#333845",
    text: "#eceef3", text2: "#a4a9b8", text3: "#6c7182",
    accent: "#3c78f2", accentText: "#8fb2ff", accentSoft: "rgba(60, 120, 242, 0.16)",
    green: "#2fb36b", greenText: "#5fd394", greenSoft: "rgba(47, 179, 107, 0.15)",
    red: "#ef5a6f", redSoft: "rgba(239, 90, 111, 0.15)",
    amber: "#e5a23a", amberSoft: "rgba(229, 162, 58, 0.14)",
    coin: "#e5a23a", coinDark: "#c4831f", coinLight: "#f0bd6a"
};

const W = 760; // logical width of every card
const PAD = 28;

/* ---------- canvas ---------- */
const create = (width, height, scale = 2) => {
    const canvas = createCanvas(Math.round(width * scale), Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.textBaseline = "alphabetic";
    return { canvas, ctx };
};

const rr = (ctx, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

const box = (ctx, x, y, w, h, { r = 12, fill = C.surface, stroke = C.border } = {}) => {
    rr(ctx, x, y, w, h, r);
    if(fill) { ctx.fillStyle = fill; ctx.fill(); };
    if(stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); };
};

// Background: flat dark surface, faint dot grid, one soft light in a corner
const background = (ctx, w, h, { glow = C.accent } = {}) => {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
    for(let y = 12; y < h; y += 18) for(let x = 12; x < w; x += 18) ctx.fillRect(x, y, 1.2, 1.2);
    if(glow) {
        const g = ctx.createRadialGradient(w - 80, -40, 10, w - 80, -40, 360);
        g.addColorStop(0, hexA(glow, 0.20));
        g.addColorStop(1, hexA(glow, 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    };
};

const hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/* ---------- text ---------- */
// Draws `str`, cut with "…" when wider than `max`. Returns the drawn width.
const text = (ctx, str, x, y, { size = 15, weight = 500, color = C.text, align = "left", max = Infinity } = {}) => {
    ctx.font = font(size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    let s = String(str ?? "");
    if(ctx.measureText(s).width > max) {
        while(s.length > 1 && ctx.measureText(`${s}…`).width > max) s = s.slice(0, -1);
        s = `${s.trimEnd()}…`;
    };
    ctx.fillText(s, x, y);
    ctx.textAlign = "left";
    return ctx.measureText(s).width;
};

const measure = (ctx, str, size = 15, weight = 500) => {
    ctx.font = font(size, weight);
    return ctx.measureText(String(str)).width;
};

// Small rounded label. Returns its width.
const pill = (ctx, label, x, y, { color = C.text2, fill = C.surface2, size = 12, weight = 600, h = 24, align = "left", dot = null } = {}) => {
    const tw = measure(ctx, label, size, weight);
    const w = tw + 20 + (dot ? 12 : 0);
    const left = align === "right" ? x - w : x;
    rr(ctx, left, y, w, h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if(dot) {
        ctx.beginPath();
        ctx.arc(left + 13, y + h / 2, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = dot;
        ctx.fill();
    };
    text(ctx, label, left + 10 + (dot ? 12 : 0), y + h / 2 + size * 0.36, { size, weight, color });
    return w;
};

/* ---------- widgets ---------- */
const bar = (ctx, x, y, w, h, p, { color = C.accent, track = C.surface3 } = {}) => {
    rr(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = track;
    ctx.fill();
    const fw = Math.max(0, Math.min(1, p)) * w;
    if(fw > 0.5) {
        rr(ctx, x, y, Math.max(h, fw), h, h / 2);
        ctx.fillStyle = color;
        ctx.fill();
    };
};

// Same coin as the website (.coin-ico): amber disc with two inner rings
const coin = (ctx, cx, cy, r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.coin;
    ctx.fill();
    ctx.lineWidth = Math.max(1, r * 0.16);
    ctx.beginPath();
    ctx.arc(cx, cy, r - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.strokeStyle = C.coinDark;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r - ctx.lineWidth * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = C.coinLight;
    ctx.stroke();
};

const ring = (ctx, cx, cy, r, p, { width = 10, color = C.accent, track = C.surface3 } = {}) => {
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = track;
    ctx.stroke();
    if(p > 0.001) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, p));
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    ctx.lineCap = "butt";
};

// Check mark drawn progressively (p from 0 to 1)
const check = (ctx, cx, cy, size, p, color = "#fff") => {
    const pts = [ [ -0.42, 0.02 ], [ -0.12, 0.32 ], [ 0.45, -0.3 ] ].map(([ a, b ]) => [ cx + a * size, cy + b * size ]);
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    let d = (l1 + l2) * Math.max(0, Math.min(1, p));
    ctx.beginPath();
    ctx.moveTo(...pts[0]);
    const k1 = Math.min(1, d / l1);
    ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * k1, pts[0][1] + (pts[1][1] - pts[0][1]) * k1);
    d -= l1;
    if(d > 0) {
        const k2 = Math.min(1, d / l2);
        ctx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * k2, pts[1][1] + (pts[2][1] - pts[1][1]) * k2);
    };
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineCap = "butt";
};

/* ---------- images ---------- */
const cache = new Map();
// Node 18+ has fetch; older Node falls back to axios when it is installed
const download = async (url) => {
    if(typeof fetch === "function") {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        try {
            const r = await fetch(url, { signal: controller.signal });
            if(!r.ok) throw new Error(r.status);
            return Buffer.from(await r.arrayBuffer());
        } finally {
            clearTimeout(timer);
        };
    };
    const { data } = await require("axios")(url, { responseType: "arraybuffer", timeout: 4000 });
    return Buffer.from(data);
};
const fetchImage = async (url) => {
    if(!url) return null;
    if(cache.has(url)) return cache.get(url);
    const img = await download(url).then((buf) => loadImage(buf)).catch(() => null);
    if(cache.size > 300) cache.delete(cache.keys().next().value);
    cache.set(url, img);
    return img;
};

// Loaded once at startup; cards are drawn synchronously (GIF frames), so they use the loaded image
let logoImg = null;
const logoPath = [ "../../assets/logo.png", "../assets/logo.png" ].map((p) => path.join(__dirname, p)).find((p) => require("fs").existsSync(p));
const ready = (logoPath ? loadImage(logoPath) : Promise.reject(new Error("no logo"))).then((img) => (logoImg = img)).catch(() => null);

const acronym = (name) => String(name || "?").replace(/'s /g, " ").replace(/[\p{L}\p{N}]+/gu, (e) => [ ...e ][0]).replace(/[^\p{L}\p{N}]/gu, "").slice(0, 3) || "?";

// Server icon or avatar. Without image: acronym on a tint picked from the name (like Discord)
const picture = (ctx, img, x, y, size, { round = false, name = "", r = size * 0.28 } = {}) => {
    ctx.save();
    if(round) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    } else rr(ctx, x, y, size, size, r);
    ctx.clip();
    if(img) {
        ctx.drawImage(img, x, y, size, size);
    } else {
        const tints = [ "#3c78f2", "#2fb36b", "#e5a23a", "#ef5a6f", "#8a63d2", "#26a3b8" ];
        const h = [ ...String(name) ].reduce((a, ch) => a + ch.codePointAt(0), 0);
        ctx.fillStyle = C.surface3;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = hexA(tints[h % tints.length], 0.35);
        ctx.fillRect(x, y, size, size);
        const label = acronym(name);
        text(ctx, label, x + size / 2, y + size / 2 + size * 0.13, { size: size * (label.length > 2 ? 0.3 : 0.36), weight: 700, align: "center" });
    };
    ctx.restore();
};

// Brand line at the top-left of every card
const header = (ctx, title, sub, w = W) => {
    if(logoImg) {
        ctx.save();
        rr(ctx, PAD, PAD, 30, 30, 8);
        ctx.clip();
        ctx.drawImage(logoImg, PAD, PAD, 30, 30);
        ctx.restore();
    };
    text(ctx, title, PAD + 42, PAD + 13, { size: 15, weight: 700, max: w - PAD * 2 - 260 });
    if(sub) text(ctx, sub, PAD + 42, PAD + 29, { size: 12, weight: 500, color: C.text3, max: w - PAD * 2 - 260 });
};

// Balance chip at the top-right
const balanceChip = (ctx, label, w = W, y = PAD + 2) => {
    const tw = measure(ctx, label, 14, 700);
    const bw = tw + 46;
    box(ctx, w - PAD - bw, y, bw, 28, { r: 14, fill: C.surface, stroke: C.border });
    coin(ctx, w - PAD - bw + 16, y + 14, 7);
    text(ctx, label, w - PAD - bw + 30, y + 19, { size: 14, weight: 700 });
};

/* ---------- maths ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = {
    outCubic: (t) => 1 - Math.pow(1 - clamp(t), 3),
    inOutCubic: (t) => (t = clamp(t)) < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    outBack: (t) => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
};
// Local time of a sub-animation: maps [from, to] of the global time to [0, 1]
const span = (t, from, to) => clamp((t - from) / (to - from));

module.exports = {
    ready, C, W, PAD, font, create, rr, box, background, hexA, text, measure, pill, bar, coin, ring, check,
    fetchImage, picture, header, balanceChip, clamp, ease, span
};
