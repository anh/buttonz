import test from 'ava';

import { ButtonMachine as BM} from '../src/buttons.js';

import { parse_buttons } from '../src/cards.js';

test('skip comments and blank line', t => {
    let code = parse_buttons('tests/comments.btn');
    t.deepEqual(code,
        [ ['PUSH', 1],
          ['POP'],
          ['STOR', 'AX']
        ]
    )
})

