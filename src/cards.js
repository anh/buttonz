import fs from 'fs';
import { ButtonMachine as BM } from './buttons.js';

const OP = BM.operations();
const JUMPS = ['JUMP', 'JZ', 'JNZ'];

export const parse_buttons = (file) => {
    const lines = fs.readFileSync(file)
        .toString()
        .split("\n")
        .map(line => line.trim())
        .filter(line => !line.startsWith(";")) // skip commented lines
        .filter(line => line.length > 0);

    // === validate label 1: @lable1 @label2 cannot appear in consecutive lines
    // this code is illegal:
    // PUSH 1
    // @label1
    // @label2
    // STOR AX

    // code above instructions result in 'P@@S'
    const duplabels_idx = lines
        .map(line => line[0])
        .join("")
        .search(/@@+/)

    if (duplabels_idx >= 0) {
        throw new Error(`Found illegal consecutive labels at ${lines[duplabels_idx]}`);
    }

    // === validate label 2: next instruction after label cannot be empty
    // this code is illegal:
    // PUSH 1
    // @labelx
    // ;; End of code
    if (lines.slice(-1)[0].startsWith("@")) {
        throw new Error('Found illegal label that point to nothing');
    }

    // build instructions 
    // [['PUSH', 1], ['PUSH', 2], [ADD ], ['JUMP', '@loop'], ...]
    let instructions = [];
    for (let line of lines) {
        let [code, _comment] = line.split(";", 1);
        let [op, operand] = code.trim().split(/\s+/, 2);

        if (!(OP.includes(op) || op.startsWith('@'))) {
            console.error(`Error at line '${line}'`);
            throw new Error(`Unknown operation: ${op}`);
        }
        if (operand === undefined) {
            instructions.push([op]);
        } else {
            const num = parseInt(operand, 10)
            let arg = isNaN(num) ? operand : num
            instructions.push([op, arg]);
        }
    }

    // === build map of @label => index to jump
    // 1. Get label index
    const labels_idx = instructions
        .map((tokens, index) => [tokens[0], index])   // get instruction (first token) and its index
        .filter(([instr, index]) => instr[0] === '@') // take only labels
        // use labels' own index (in its  own label list) to adjust target line 
        .map(([label, index], label_index) => [label, index - label_index]) 


    // 2. Check if a label was redefined
    let labels_count = {}
    labels_idx.map(([token, target]) => {
        if (labels_count[token] === undefined)
            labels_count[token] = 1
        else
            labels_count[token] += 1;
    });

    for (let [label , count] of Object.entries(labels_count)) {
        if (count > 1) {
            console.error(`Label ${label} was redefined`);
            throw new Error('Label redefined');
        }
    }

    // 3. Construct jump table
    const labels_map = new Map(labels_idx);
    console.log('Label to jump MAP:', labels_map);

    // 4. Replace @label with jump target
    instructions = instructions
        .filter(tokens => tokens[0][0] !== '@')
        .map(tokens => {
            // only replace jump using label with target number
            if (!(JUMPS.includes(tokens[0]) && tokens[1][0] === '@')) 
                return tokens;
            
            const target = labels_map.get(tokens[1]);
            if (target === undefined) {
                console.error(`Jump to non exist label ${tokens[1]}`);
                throw new Error('Non-exist label');
            }
            return [tokens[0], target];
        })
    return instructions;
}
