require("dotenv").config();

const required = [ "TOKEN", "API_KEY", "FASTJOINS_URL" ];
const missing = required.filter((key) => !process.env[key]);
if(missing.length) {
    console.error(`Missing variables in .env: ${missing.join(", ")} (copy .env.example to .env)`);
    process.exit(1);
};

module.exports = {
    token: process.env.TOKEN,
    apiKey: process.env.API_KEY,
    baseUrl: process.env.FASTJOINS_URL.replace(/\/+$/, ""),
    guildId: process.env.GUILD_ID || null,
    owners: (process.env.OWNERS || "").split(",").map((s) => s.trim()).filter(Boolean),
    color: 0x3c78f2
};
