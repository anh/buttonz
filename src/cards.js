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

    // code above result in 'P@@S'
    const first_chars = lines
        .map(line => line[0])
        .join("")

    const found_illegal_index = first_chars.search(/@@+/)
    if (found_illegal_index >= 0) {
        throw new Error(`Found illegal consecutive labels at ${lines[found_illegal_index]}`);
    }

    // === validate label 2: next instruction after label cannot be empty
    // this code is illegal:
    // PUSH 1
    // @labelx
    // ;; End of code
    if (lines[lines.length - 1][0].startsWith("@")) {
        throw new Error('Found illegal label that point to nothing');
    }

    let result = [];
    for (let line of lines) {
        let [code, comment] = line.split(";", 1);
        let [op, data] = code.trim().split(/\s+/, 2);

        if (!(OP.includes(op) || op.startsWith('@'))) {
            console.error(`Error at line '${line}'`);
            throw new Error(`Unknown operation: ${op}`);
        }
        if (data == undefined) {
            result.push([op]);
        } else {
            const num = parseInt(data, 10)
            let arg = isNaN(num) ? data : num
            result.push([op, arg]);
        }
    }

    // === build map of @label => index to jump
    // 1. Get label index
    const labels_idx = result
        .map((tokens, index) => [tokens[0], index]) // do mapping first to keep index order
        .filter(([token, index]) => token[0] === '@') // filter to get lables
        .map(([token, index], label_index) => [token, index - label_index]) // use labels' own index (in its  own label list) to adjust target line


    // 2. Check if a label was redefined
    let labels_count = {}
    labels_idx.map(([token, target]) => {
        if (labels_count[token] == undefined)
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

    // 4. Replace @label with jump index
    result = result
        .filter(tokens => tokens[0][0] !== '@') // remove label line
        .map(tokens => {
            if (JUMPS.includes(tokens[0]) && tokens[1][0] === '@') {
                const target = labels_map.get(tokens[1]);
                if (target === undefined) {
                    console.error(`Jump to non exist label ${tokens[1]}`);
                    throw new Error('Non-exist label');
                }
                return [tokens[0], target];
            }
            return tokens;
        })
    return result;
}
