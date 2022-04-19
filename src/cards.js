import fs from 'fs';
import { ButtonMachine as BM } from './buttons.js';

const OP = BM.operations();

export const parse_buttons = (file) => {
    const lines = fs.readFileSync(file)
        .toString()
        .split("\n")
        .map(line => line.trim())
        .filter(line => !line.startsWith(";")) // skip commented lines
        .filter(line => line.length > 0);

    let result = [];
    for (const line of lines) {
        let [code, comment] = line.split(";", 1);
        let [op, data] = code.trim().split(/\s+/, 2);

        if (!OP.includes(op)) {
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
    return result;
}
