/**
 * Minimal translations. The language follows the Discord client of the user (interaction.locale).
 * Add a language by copying the "en" block.
 */
const strings = {
    en: {
        error: "Something went wrong: {message}",
        balance: "**{user}** has **{coins} coins**.",
        noTx: "No transactions yet.",
        lastTx: "Last transactions",
        dailyOk: "You claimed **{amount} coins**! Streak: **{streak} day(s)**.",
        dailyWait: "Already claimed. Come back <t:{at}:R>.",
        farmEmpty: "No server to join right now, come back later!",
        farmTitle: "Join a server, earn {reward} coin(s)",
        farmDesc: "1. Click **Join** and join the server.\n2. Come back and click **I joined** to get your coins.\nStay **{days} days** or you lose coins.",
        farmJoin: "Join", farmClaim: "I joined", farmNext: "Next server",
        progress: "{uses} / {orders} members",
        claimed: "**+{coins} coins**! Your balance: **{balance}**.",
        checkYes: "You can leave this server without losing coins.",
        checkNo: "Stay a bit longer: you can leave <t:{at}:R>.",
        checkAll: "**Safe to leave:** {safe}\n**Not yet:** {locked}",
        none: "none",
        payDone: "You sent **{coins} coins** to {to}.",
        confirm: "Confirm on FastJoins (link valid 24 h): {url}",
        buyDone: "Campaign started for **{coins} members**!",
        infoNone: "No campaign on this server.",
        infoRun: "Campaign running: **{uses} / {orders}** members.",
        infoNoBot: "FastJoins isn't on this server yet: {url}",
        top: "Leaderboard",
        stats: "Affiliated users: **{users}** (+{users30} in 30 days)\nTheir joins: **{joins}**\nEarned: **{earned} coins**\nAPI requests (30 d): **{req}**\nBalance: **{balance}**",
        ownerOnly: "This command is reserved to the bot owner.",
        help: "**Commands**\n/farm — join servers and earn coins\n/daily — daily reward\n/balance — your coins\n/check — can I leave a server?\n/pay — send coins\n/buy — promote this server\n/info — campaign of this server\n/leaderboard — top users\n\nPowered by FastJoins: {url}"
    },
    fr: {
        error: "Une erreur est survenue : {message}",
        balance: "**{user}** a **{coins} pièces**.",
        noTx: "Aucune opération pour l'instant.",
        lastTx: "Dernières opérations",
        dailyOk: "Tu as récupéré **{amount} pièces** ! Série : **{streak} jour(s)**.",
        dailyWait: "Déjà récupérée. Reviens <t:{at}:R>.",
        farmEmpty: "Aucun serveur à rejoindre pour l'instant, reviens plus tard !",
        farmTitle: "Rejoins un serveur, gagne {reward} pièce(s)",
        farmDesc: "1. Clique sur **Rejoindre** et rejoins le serveur.\n2. Reviens et clique sur **J'ai rejoint** pour recevoir tes pièces.\nReste **{days} jours** sinon tu perds des pièces.",
        farmJoin: "Rejoindre", farmClaim: "J'ai rejoint", farmNext: "Serveur suivant",
        progress: "{uses} / {orders} membres",
        claimed: "**+{coins} pièces** ! Ton solde : **{balance}**.",
        checkYes: "Tu peux quitter ce serveur sans perdre de pièces.",
        checkNo: "Reste encore un peu : tu pourras partir <t:{at}:R>.",
        checkAll: "**Libres :** {safe}\n**Pas encore :** {locked}",
        none: "aucun",
        payDone: "Tu as envoyé **{coins} pièces** à {to}.",
        confirm: "Confirme sur FastJoins (lien valable 24 h) : {url}",
        buyDone: "Campagne lancée pour **{coins} membres** !",
        infoNone: "Aucune campagne sur ce serveur.",
        infoRun: "Campagne en cours : **{uses} / {orders}** membres.",
        infoNoBot: "FastJoins n'est pas encore sur ce serveur : {url}",
        top: "Classement",
        stats: "Utilisateurs affiliés : **{users}** (+{users30} en 30 jours)\nLeurs serveurs rejoints : **{joins}**\nGagné : **{earned} pièces**\nRequêtes API (30 j) : **{req}**\nSolde : **{balance}**",
        ownerOnly: "Cette commande est réservée au propriétaire du bot.",
        help: "**Commandes**\n/farm — rejoindre des serveurs et gagner des pièces\n/daily — récompense quotidienne\n/balance — tes pièces\n/check — puis-je quitter un serveur ?\n/pay — envoyer des pièces\n/buy — promouvoir ce serveur\n/info — campagne de ce serveur\n/leaderboard — classement\n\nPropulsé par FastJoins : {url}"
    }
};

const t = (locale, key, vars = {}) => {
    const lang = String(locale || "en").slice(0, 2);
    const str = (strings[lang] || strings.en)[key] ?? strings.en[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
};

module.exports = { t };
