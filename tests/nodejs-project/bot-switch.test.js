// Interrupteur du bot — SEEKERCLAW_BOT_DISABLED / config.json "botDisabled".
//
// Le bot est neutralisé quand l'un des deux drapeaux est vrai ; aucune autre
// valeur (absente, vide, "0", "false") ne doit couper le bot.

'use strict';

const assert = require('assert');
const path = require('path');

const BUNDLE = path.resolve(__dirname, '..', '..', 'app', 'src', 'main', 'assets', 'nodejs-project');
const { isBotDisabled, parseFlag } = require(path.join(BUNDLE, 'bot-switch.js'));

let failures = 0;
function check(name, fn) {
    try {
        fn();
        console.log(`  ok — ${name}`);
    } catch (e) {
        failures++;
        console.error(`  FAIL — ${name}: ${e.message}`);
    }
}

console.log('bot-switch: parseFlag');
check('true / false booleans', () => {
    assert.strictEqual(parseFlag(true), true);
    assert.strictEqual(parseFlag(false), false);
});
check('"1"', () => assert.strictEqual(parseFlag('1'), true));
check('case and spaces', () => assert.strictEqual(parseFlag('  TRUE '), true));
check('"yes"/"on"', () => {
    assert.strictEqual(parseFlag('yes'), true);
    assert.strictEqual(parseFlag('on'), true);
});
check('"0"/"false"/"" are off', () => {
    assert.strictEqual(parseFlag('0'), false);
    assert.strictEqual(parseFlag('false'), false);
    assert.strictEqual(parseFlag(''), false);
});
check('non-strings are off', () => {
    assert.strictEqual(parseFlag(undefined), false);
    assert.strictEqual(parseFlag(null), false);
    assert.strictEqual(parseFlag(1), false);
});

console.log('bot-switch: isBotDisabled');
check('no env, no config → enabled', () => {
    assert.strictEqual(isBotDisabled({}, null), false);
});
check('env SEEKERCLAW_BOT_DISABLED=1 → disabled', () => {
    assert.strictEqual(isBotDisabled({ SEEKERCLAW_BOT_DISABLED: '1' }, null), true);
});
check('config.botDisabled=true → disabled', () => {
    assert.strictEqual(isBotDisabled({}, { botDisabled: true }), true);
});
check('config.botDisabled="true" → disabled', () => {
    assert.strictEqual(isBotDisabled({}, { botDisabled: 'true' }), true);
});
check('other config keys change nothing', () => {
    assert.strictEqual(isBotDisabled({}, { botDisabled: '0', channel: 'telegram' }), false);
});
check('env off + config off → enabled', () => {
    assert.strictEqual(isBotDisabled({ SEEKERCLAW_BOT_DISABLED: 'false' }, { botDisabled: false }), false);
});

if (failures > 0) {
    console.error(`\n${failures} bot-switch test(s) failed.`);
    process.exit(1);
}
console.log('\nAll bot-switch tests passed.');
