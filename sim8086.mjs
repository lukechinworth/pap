import { readFileSync } from "fs";

const [, , input_path] = process.argv;

const buffer = readFileSync(input_path);

const ops = {
    "100010": "mod"
};

for (let i = 0; i < buffer.length; i++) {
    const byte = buffer.readUInt8(i);
    const bits = byte.toString(2);

    const op = ops[bits.slice(0, 6)];

    console.log(op);
}
