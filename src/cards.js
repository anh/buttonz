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
    for (const line of lines) {
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
        // do mapping first to keep index order
        .map((tokens, index) => [tokens[0], index])
        // filter to get lables
        .filter(([token, index]) => token[0] === '@') //
        // all label with be remove, use labels' own index (in its  own label list) to adjust target line
        .map(([token, index], label_index) => [token, index - label_index])

    // 2. Construct jump table
    const labels_map = new Map(labels_idx);
    console.log('Label to jump MAP:', labels_map);

    // 3. Replace @label with jump index
    result = result
        .filter(tokens => tokens[0][0] !== '@') // remove label line
        .map(tokens => {
            if (JUMPS.includes(tokens[0])) {
                return [tokens[0], labels_map.get(tokens[1])];
            }
            return tokens;
        })
    return result;
}
