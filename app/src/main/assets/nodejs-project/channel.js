// channel.js — Thin router for channel abstraction
// Picks telegram or discord at init(), forwards all calls.
// Adding a new channel = implement the interface in a new file, add to init().

const { CHANNEL, config, log } = require('./config');
const { isBotDisabled } = require('./bot-switch');

// `disabled: true` distingue l'interrupteur d'une vraie erreur réseau.
const DISABLED_RESULT = { ok: false, disabled: true, description: 'Bot désactivé (SEEKERCLAW_BOT_DISABLED).' };

let impl = null;

function assertInit() {
    if (!impl) throw new Error('channel.js: init() must be called before use');
}

function init() {
    if (CHANNEL === 'discord') {
        impl = require('./discord');
    } else {
        impl = require('./telegram');
    }
    log(`[Channel] Initialized: ${CHANNEL}`, 'INFO');
}

module.exports = {
    init,
    start(onMessage, onReaction) {
        assertInit();
        // Neutralisé : aucun getUpdates / gateway WebSocket, quel que soit le canal.
        if (isBotDisabled(process.env, config)) {
            log('[Channel] Bot désactivé (SEEKERCLAW_BOT_DISABLED ou config.json→botDisabled) : aucune connexion.', 'WARN');
            return;
        }
        return impl.start(onMessage, onReaction);
    },
    stop() { assertInit(); return impl.stop(); },
    sendMessage(chatId, text, replyTo) {
        assertInit();
        if (isBotDisabled(process.env, config)) return Promise.resolve(DISABLED_RESULT);
        return impl.sendMessage(chatId, text, replyTo);
    },
    // BAT-1050 P1A: channel-agnostic plain/system send — for synthetic/system
    // notices (heartbeat, back-online, status) that must NEVER render Rich.
    // Telegram implements systemPlain (raw, no parse_mode); Discord (no
    // sendMessageSystem) falls back to its existing normal send (its plain behavior).
    sendMessageSystem(chatId, text) {
        assertInit();
        if (isBotDisabled(process.env, config)) return Promise.resolve(DISABLED_RESULT);
        return (impl.sendMessageSystem || impl.sendMessage)(chatId, text);
    },
    sendTyping(chatId) { assertInit(); return impl.sendTyping(chatId); },
    sendFile(chatId, filePath, caption) {
        assertInit();
        if (isBotDisabled(process.env, config)) return Promise.resolve(DISABLED_RESULT);
        return impl.sendFile(chatId, filePath, caption);
    },
    editMessage(chatId, messageId, text, replyMarkup) { assertInit(); return impl.editMessage(chatId, messageId, text, replyMarkup); },
    deleteMessage(chatId, messageId) { assertInit(); return impl.deleteMessage(chatId, messageId); },
    getOwnerChatId() { assertInit(); return impl.getOwnerChatId(); },
    createStatusReactionController(chatId, messageId) {
        assertInit();
        return impl.createStatusReactionController(chatId, messageId);
    },
};
