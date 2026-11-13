/**
 * Small helpers to build replies: one image + component rows, nothing else.
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// A message made of one image. `attachments: []` replaces the previous image when editing.
const view = (file, rows = []) => ({ content: "", embeds: [], files: [ file ], attachments: [], components: rows.filter(Boolean) });

const row = (...components) => {
    const list = components.flat().filter(Boolean);
    return list.length ? new ActionRowBuilder().addComponents(list) : null;
};

const button = (id, label, style = ButtonStyle.Secondary, disabled = false) =>
    new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style).setDisabled(disabled);

const linkButton = (url, label) => new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(url).setLabel(label);

// Discord user -> what the cards need
const person = (user) => ({ name: user.globalName || user.username, avatar: user.displayAvatarURL({ extension: "png", size: 128 }) });

module.exports = { view, row, button, linkButton, person, ButtonStyle };
