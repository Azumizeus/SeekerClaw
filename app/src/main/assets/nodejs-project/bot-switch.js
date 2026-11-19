// SeekerClaw — interrupteur du bot.
//
// Deux façons de neutraliser le bot, sans supprimer ni tokens ni config :
//   • variable d'environnement SEEKERCLAW_BOT_DISABLED=1
//   • "botDisabled": true dans config.json
//
// Quand il est désactivé : aucun getUpdates (le bot n'écoute plus) et aucune
// requête sortante vers l'API Telegram. Il suffit de retirer le drapeau pour
// rallumer le bot au démarrage suivant.

'use strict';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

/** true pour true, "1", "true", "yes", "on" (insensible à la casse et aux espaces). */
function parseFlag(raw) {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw !== 'string') return false;
    return TRUE_VALUES.has(raw.trim().toLowerCase());
}

function isBotDisabled(env = process.env, config = null) {
    if (parseFlag(env.SEEKERCLAW_BOT_DISABLED)) return true;
    return config != null && parseFlag(config.botDisabled);
}

module.exports = { isBotDisabled, parseFlag };
