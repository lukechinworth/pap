import { readFileSync } from "fs";

const [, , input_path] = process.argv;

const buffer = readFileSync(input_path);

const op_map = {
    "100010": "mod",
};

const mod_map = {
    "11": "regreg",
};

// Top level key is w bit.
const reg_map = {
    "0": {
        "000": "al",
        "001": "cl",
        "010": "dl",
        "011": "bl",
        "100": "ah",
        "101": "ch",
        "110": "dh",
        "111": "bh",
    },
    "1": {
        "000": "ax",
        "001": "cx",
        "010": "dx",
        "011": "bx",
        "100": "sp",
        "101": "bp",
        "110": "si",
        "111": "di",
    },
};

let byte1;
let op,
    d, // "dest", 1 = reg is dest, 0 = reg is source.
    w, // "wide"
    mod, // reg2reg, reg2mem, mem2mem, mem2reg, etc.
    reg, // reg address
    rm; // reg/mem address

for (let i = 0; i < buffer.length; i++) {
    byte1 = !byte1;

    const byte = buffer.readUInt8(i);
    const bits = byte.toString(2);

    if (byte1) {
        op = bits.slice(0, 6);
        d = bits[6];
        w = bits[7];

        continue;
    } else {
        mod = bits.slice(0, 2); // TODO: currently unused. all we do is reg to reg right now.
        reg = bits.slice(2, 5);
        rm = bits.slice(5, 8);
    }

    const op_asm = op_map[op];
    let dest_asm = reg_map[w][reg];
    let source_asm = reg_map[w][rm];

    if (d === '0') {
        const dest_tmp = dest_asm;
        dest_asm = source_asm;
        source_asm = dest_tmp;
    }

    console.log(`${op_asm} ${dest_asm}, ${source_asm}`)
}
