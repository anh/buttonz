import test from 'ava';

import { ButtonMachine as BM} from '../src/buttons.js';

import { parse_buttons } from '../src/cards.js';

test('Labels: Too many consecutive labels', t => {
    t.throws(() => {
        parse_buttons('tests/labels_dup.btn');
    });
})

test('Labels: label to nowhere', t => {
    t.throws(() => {
        parse_buttons('tests/labels_to_nowhere.btn');
    });
})

test('Labels: jump to non-exist label', t => {
    t.throws(() => {
        parse_buttons('tests/labels_none_exist.btn');
    });
})

test('Labels: redefine label', t => {
    t.throws(() => {
        parse_buttons('tests/labels_redefine.btn');
    });
})

