/**
 * Translations. The language follows the Discord client of the user (interaction.locale).
 * Add a language by copying the "en" block; missing keys fall back to English.
 */
const strings = {
    en: {
        error: "Something went wrong: {message}",
        reasons: [ "Joined a server", "Left a server", "Campaign", "Coins sent", "Coins received", "Adjustment", "Giveaway", "Boost", "Daily reward", "Daily reward", "Referral join", "Referral", "Milestone", "Affiliation" ],
        farm: {
            title: "Farm", sub: "{n} servers available · +{reward} coin per server",
            members: "{uses} / {orders} members", pick: "Pick a server in the menu below to join it.", more: "And {n} more in the menu below.",
            empty: "No server to join right now", emptySub: "Come back in a little while, new campaigns start every day.",
            linkHint: "Allow the bot once on FastJoins to join servers in one click.",
            select: "Pick a server to join", option: "{uses}/{orders} members · +{reward} coins",
            auto: "Auto-farm", refresh: "Refresh", allow: "Allow the bot", back: "Back", next: "Next server", joining: "Joining {name}…"
        },
        join: { done: "SERVER JOINED", sub: "Coins added to your balance", stay: "Stay {days} days on the server to keep your coins." },
        invite: { title: "Join by hand", sub: "You haven't allowed the bot yet", s1: "Open the invite and join.", s2: "Come back and press \"I joined\".", join: "Open the invite", claim: "I joined" },
        link: {
            title: "Allow the bot", sub: "One time only, on the FastJoins website",
            s1: "Open the link and log in with Discord.", s2: "Allow this bot to make you join servers.", s3: "Come back here and press Refresh.",
            foot: "The bot never sees your Discord token. You can revoke it in FastJoins settings.", open: "Open FastJoins"
        },
        auto: {
            title: "Auto-farm", sub: "{n} servers available", goal: "Goal: {n} servers", servers: "{n} servers", max: "Max",
            hint: "It runs on FastJoins: you can close Discord, it keeps going.",
            running: "Running", done: "Done", stopped: "Stopped", error: "Stopped by Discord",
            earned: "coins earned", last: "LAST SERVERS", closeOk: "You can close this message, it keeps going.",
            stop: "Stop", again: "Farm again", start: "{n} servers"
        },
        balance: { title: "Balance", label: "Balance", level: "Level {n}", last: "LAST TRANSACTIONS", none: "No transactions yet." },
        daily: { title: "Daily reward", claimed: "Come back tomorrow to keep your streak", wait: "Next reward {when}", soon: "Already claimed", streak: "Streak: {n} day(s)", day: "D{n}" },
        pay: { title: "Transfer", done: "Coins sent", pending: "Waiting for your confirmation", doneChip: "Sent", pendingChip: "Confirm on FastJoins (24 h)", confirm: "Confirm" },
        campaign: {
            started: "Campaign started", startedSub: "New members will arrive soon",
            pending: "Confirm the campaign", pendingSub: "{coins} members · confirm on FastJoins", pendingHint: "Open the link below to confirm. It expires in 24 h.",
            info: "Campaign running", infoSub: "Members are joining",
            none: "No campaign", noneSub: "This server isn't promoted", noneHint: "Use /buy to promote it with your coins.",
            nobot: "FastJoins isn't here", nobotSub: "Add it to promote this server", nobotHint: "Add FastJoins to this server first, then try again.",
            cost: "{coins} coins · 1 coin = 1 member", add: "Add FastJoins"
        },
        check: {
            title: "Can I leave?", yes: "You can leave this server", yesSub: "You won't lose any coins.", no: "Stay a little longer", noSub: "You can leave {when}.",
            allSub: "{safe} free · {locked} to keep", safe: "Free to leave", locked: "Stay a bit", more: "Only the first 6 of each list are shown."
        },
        top: { title: "Leaderboard", sub: "Users with the most coins", me: "You are #{rank}" },
        stats: { title: "Developer stats", sub: "Users of your bot are affiliated to your API key", users: "Affiliated users", users30: "+{n} in 30 days", joins: "Their joins", earned: "Earned", requests: "API requests (30 d)", total: "{n} in total" },
        help: {
            title: "Commands", sub: "Everything this bot can do", foot: "Powered by FastJoins · {url}",
            farm: "Join servers, earn coins", daily: "Daily reward", balance: "Your coins", pay: "Send coins", buy: "Promote this server",
            check: "Can I leave a server?", info: "Campaign of this server", leaderboard: "Top users", stats: "Your earnings (owner)", help: "This list"
        },
        ownerOnly: "This command is reserved to the bot owner."
    },
    fr: {
        error: "Une erreur est survenue : {message}",
        reasons: [ "Serveur rejoint", "Serveur quitté", "Campagne", "Pièces envoyées", "Pièces reçues", "Ajustement", "Concours", "Boost", "Récompense quotidienne", "Récompense quotidienne", "Filleul actif", "Parrainage", "Palier", "Affiliation" ],
        farm: {
            title: "Farm", sub: "{n} serveurs disponibles · +{reward} pièce par serveur",
            members: "{uses} / {orders} membres", pick: "Choisis un serveur dans le menu pour le rejoindre.", more: "Et {n} de plus dans le menu.",
            empty: "Aucun serveur à rejoindre", emptySub: "Reviens un peu plus tard, de nouvelles campagnes démarrent chaque jour.",
            linkHint: "Autorise le bot une fois sur FastJoins pour rejoindre en un clic.",
            select: "Choisis un serveur à rejoindre", option: "{uses}/{orders} membres · +{reward} pièces",
            auto: "Auto-farm", refresh: "Actualiser", allow: "Autoriser le bot", back: "Retour", next: "Serveur suivant", joining: "Je rejoins {name}…"
        },
        join: { done: "SERVEUR REJOINT", sub: "Pièces ajoutées à ton solde", stay: "Reste {days} jours sur le serveur pour garder tes pièces." },
        invite: { title: "Rejoindre à la main", sub: "Tu n'as pas encore autorisé le bot", s1: "Ouvre l'invitation et rejoins.", s2: "Reviens et appuie sur « J'ai rejoint ».", join: "Ouvrir l'invitation", claim: "J'ai rejoint" },
        link: {
            title: "Autoriser le bot", sub: "Une seule fois, sur le site FastJoins",
            s1: "Ouvre le lien et connecte-toi avec Discord.", s2: "Autorise ce bot à te faire rejoindre des serveurs.", s3: "Reviens ici et appuie sur Actualiser.",
            foot: "Le bot ne voit jamais ton jeton Discord. Tu peux le retirer dans les paramètres FastJoins.", open: "Ouvrir FastJoins"
        },
        auto: {
            title: "Auto-farm", sub: "{n} serveurs disponibles", goal: "Objectif : {n} serveurs", servers: "{n} serveurs", max: "Max",
            hint: "Ça tourne sur FastJoins : tu peux fermer Discord, ça continue.",
            running: "En cours", done: "Terminé", stopped: "Arrêté", error: "Arrêté par Discord",
            earned: "pièces gagnées", last: "DERNIERS SERVEURS", closeOk: "Tu peux fermer ce message, ça continue.",
            stop: "Arrêter", again: "Relancer", start: "{n} serveurs"
        },
        balance: { title: "Solde", label: "Solde", level: "Niveau {n}", last: "DERNIÈRES OPÉRATIONS", none: "Aucune opération pour l'instant." },
        daily: { title: "Récompense quotidienne", claimed: "Reviens demain pour garder ta série", wait: "Prochaine récompense {when}", soon: "Déjà récupérée", streak: "Série : {n} jour(s)", day: "J{n}" },
        pay: { title: "Transfert", done: "Pièces envoyées", pending: "En attente de ta confirmation", doneChip: "Envoyé", pendingChip: "Confirme sur FastJoins (24 h)", confirm: "Confirmer" },
        campaign: {
            started: "Campagne lancée", startedSub: "Les nouveaux membres arrivent bientôt",
            pending: "Confirme la campagne", pendingSub: "{coins} membres · à confirmer sur FastJoins", pendingHint: "Ouvre le lien ci-dessous pour confirmer. Il expire dans 24 h.",
            info: "Campagne en cours", infoSub: "Les membres arrivent",
            none: "Aucune campagne", noneSub: "Ce serveur n'est pas promu", noneHint: "Utilise /buy pour le promouvoir avec tes pièces.",
            nobot: "FastJoins n'est pas là", nobotSub: "Ajoute-le pour promouvoir ce serveur", nobotHint: "Ajoute d'abord FastJoins sur ce serveur, puis réessaie.",
            cost: "{coins} pièces · 1 pièce = 1 membre", add: "Ajouter FastJoins"
        },
        check: {
            title: "Puis-je partir ?", yes: "Tu peux quitter ce serveur", yesSub: "Tu ne perdras aucune pièce.", no: "Reste encore un peu", noSub: "Tu pourras partir {when}.",
            allSub: "{safe} libres · {locked} à garder", safe: "Libres", locked: "À garder", more: "Seuls les 6 premiers de chaque liste sont affichés."
        },
        top: { title: "Classement", sub: "Les utilisateurs qui ont le plus de pièces", me: "Tu es n°{rank}" },
        stats: { title: "Stats développeur", sub: "Les utilisateurs de ton bot sont affiliés à ta clé API", users: "Utilisateurs affiliés", users30: "+{n} en 30 jours", joins: "Serveurs rejoints", earned: "Gagné", requests: "Requêtes API (30 j)", total: "{n} au total" },
        help: {
            title: "Commandes", sub: "Tout ce que ce bot sait faire", foot: "Propulsé par FastJoins · {url}",
            farm: "Rejoindre des serveurs", daily: "Récompense quotidienne", balance: "Tes pièces", pay: "Envoyer des pièces", buy: "Promouvoir ce serveur",
            check: "Puis-je quitter un serveur ?", info: "Campagne de ce serveur", leaderboard: "Classement", stats: "Tes gains (propriétaire)", help: "Cette liste"
        },
        ownerOnly: "Cette commande est réservée au propriétaire du bot."
    }
};

const lookup = (obj, key) => key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
const langOf = (locale) => (strings[String(locale || "en").slice(0, 2)] ? String(locale).slice(0, 2) : "en");

const t = (locale, key, vars = {}) => {
    const str = lookup(strings[langOf(locale)], key) ?? lookup(strings.en, key) ?? key;
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
};

/**
 * Everything a card needs to speak the user's language:
 * l.t(key, vars), l.num(1234.5) -> "1 234,5", l.rel(timestamp) -> "in 3 hours", l.reason(code)
 */
const forLocale = (locale) => {
    const lang = langOf(locale);
    const nf = new Intl.NumberFormat(locale || "en", { maximumFractionDigits: 2 });
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    return {
        lang,
        t: (key, vars) => t(locale, key, vars),
        num: (n) => nf.format(Number(n) || 0),
        rel: (ts) => {
            const diff = Number(ts) - Date.now();
            const abs = Math.abs(diff);
            if(abs < 6e4) return rtf.format(0, "second"); // "now"
            if(abs < 36e5) return rtf.format(Math.round(diff / 6e4), "minute");
            if(abs < 864e5) return rtf.format(Math.round(diff / 36e5), "hour");
            return rtf.format(Math.round(diff / 864e5), "day");
        },
        reason: (code) => (lookup(strings[lang], "reasons") || strings.en.reasons)[code] || "—"
    };
};

// Merges extra texts into the tables (another bot reusing these cards can add or override keys)
const extend = (extra) => {
    const merge = (a, b) => {
        for(const [ k, v ] of Object.entries(b)) {
            if(v && typeof v === "object" && !Array.isArray(v)) merge(a[k] = a[k] || {}, v);
            else a[k] = v;
        };
    };
    for(const [ lang, table ] of Object.entries(extra)) merge(strings[lang] = strings[lang] || {}, table);
};

module.exports = { t, forLocale, extend, strings };
