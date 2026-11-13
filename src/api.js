/**
 * Tiny client for the FastJoins public API (see https://fastjoins.fr/docs).
 * Every method resolves with `data` or throws an ApiError with the API message.
 */
const config = require("./config");

class ApiError extends Error {
    constructor (message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
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
        if(!json.success) throw new ApiError(json.error?.message || `HTTP ${res.status}`, res.status, json.error?.code);
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
    getUser: (userId) => call("user/get", { user_id: userId }),
    farm: (userId) => call("farm", { user_id: userId }),
    claim: (userId, guildId) => call("farm/claim", { user_id: userId, guild_id: guildId }),
    check: (userId, guildId) => call("check", { user_id: userId, guild_id: guildId }),
    checkAll: (userId) => call("check/all", { user_id: userId }),
    daily: (userId) => call("daily", { user_id: userId }),
    pay: (from, to, coins) => call("pay", { from, to, coins }),
    buy: (userId, guildId, coins, channelId) => call("buy", { user_id: userId, guild_id: guildId, coins, channel_id: channelId }),
    info: (guildId) => call("info", { guild_id: guildId }),
    leaderboard: () => call("leaderboard"),
    stats: () => call("developer/stats")
};
