/**
 * Tiny client for the FastJoins public API (see https://fastjoins.fr/docs).
 * Every method resolves with `data` or throws an ApiError with the API message.
 */
const config = require("./config");

class ApiError extends Error {
    constructor (message, status, code, details = {}) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details; // the whole error object, e.g. { link_url } for code 9
    };
};

const call = async (path, body = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch(`${config.baseUrl}/api/v1/${path}`, {
            method: "POST",
            headers: { "Authorization": config.apiKey, "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        const json = await res.json().catch(() => ({}));
        if(!json.success) throw new ApiError(json.error?.message || `HTTP ${res.status}`, res.status, json.error?.code, json.error);
        return json.data;
    } catch (err) {
        if(err.name === "AbortError") throw new ApiError("FastJoins did not answer in time.", 504);
        throw err instanceof ApiError ? err : new ApiError(err.message, 0);
    } finally {
        clearTimeout(timer);
    };
};

module.exports = {
    ApiError,
    // users
    getUser: (userId) => call("user/get", { user_id: userId }),
    link: (userId) => call("user/link", { user_id: userId }),
    // farm
    farm: (userId) => call("farm", { user_id: userId }),
    join: (userId, guildId) => call("farm/join", { user_id: userId, guild_id: guildId }),
    autoStart: (userId, count) => call("farm/auto", { user_id: userId, count }),
    autoStatus: (userId) => call("farm/auto/status", { user_id: userId }),
    autoStop: (userId) => call("farm/auto/stop", { user_id: userId }),
    claim: (userId, guildId) => call("farm/claim", { user_id: userId, guild_id: guildId }),
    check: (userId, guildId) => call("check", { user_id: userId, guild_id: guildId }),
    checkAll: (userId) => call("check/all", { user_id: userId }),
    // coins
    daily: (userId) => call("daily", { user_id: userId }),
    pay: (from, to, coins) => call("pay", { from, to, coins }),
    // campaigns
    buy: (userId, guildId, coins, channelId) => call("buy", { user_id: userId, guild_id: guildId, coins, channel_id: channelId }),
    info: (guildId) => call("info", { guild_id: guildId }),
    // misc
    leaderboard: () => call("leaderboard"),
    stats: () => call("developer/stats")
};
