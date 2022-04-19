import fs from 'fs';
import { ButtonMachine as BM } from './buttons.js';
import { parse_buttons }  from './cards.js';

const button = process.argv[2];

console.log(`=== Button card: '${button}'`);
console.log(fs.readFileSync(button).toString())

const code = parse_buttons(button);
console.log(`=== Parsed button card into code:`);
console.log(code);

console.log('=== Start running Button Machine: ' );

const bm = new BM(code);

const registers = bm.register_entries;

bm.run();

console.log(bm.registers);
console.log(bm.stack);
