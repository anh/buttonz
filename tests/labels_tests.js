import test from 'ava';

import { ButtonMachine as BM} from '../src/buttons.js';

import { parse_buttons } from '../src/cards.js';

test('Too many consecutive labels', t => {
    t.throws(() => {
        parse_buttons('tests/labels_dup.btn');
    });
})

test('Labels to nowhere', t => {
    t.throws(() => {
        parse_buttons('tests/labels_to_nowhere.btn');
    });
})

