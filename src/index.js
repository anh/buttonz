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

bm.run();

console.log('REGISTERS: ', bm.registers);
console.log('STACK: ', bm.stack);
console.log('RAM: ', bm.ram);
