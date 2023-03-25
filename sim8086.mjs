import { readFileSync } from "fs";

const [, , input_path] = process.argv;

const buffer = readFileSync(input_path);

const mod_map = {
    "00": "mem, 0 disp",
    "01": "mem, 8 disp",
    "10": "mem, 16 disp",
    "11": "reg",
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

let d, // "dest", 1 = reg is dest, 0 = reg is source.
    w, // "wide"
    mod, // reg2reg, reg2mem, mem2mem, mem2reg, etc.
    reg, // reg address
    rm, // reg/mem address
    data;

for (let i = 0; i < buffer.length; i++) {
    let byte = buffer.readUInt8(i);
    let bits = byte.toString(2);

    // register/memory to/from register
    if (bits.slice(0, 6) === "100010") {
        d = bits[6];
        w = bits[7];
        i++;
        byte = buffer.readUInt8(i);
        bits = byte.toString(2);
        mod = bits.slice(0, 2); // TODO: currently unused. all we do is reg to reg right now.
        reg = bits.slice(2, 5);
        rm = bits.slice(5, 8);

        let dest_asm = reg_map[w][reg];
        let source_asm = reg_map[w][rm];

        if (d === '0') {
            const dest_tmp = dest_asm;
            dest_asm = source_asm;
            source_asm = dest_tmp;
        }

        console.log(`mov ${dest_asm}, ${source_asm}`);
        continue;
    }

    // immediate to register
    if (bits.slice(0, 4) === "1011") {
        w = bits[4];
        reg = bits.slice(5, 8);
        i++;

        if (w === "1") {
            data = buffer.readUInt16LE(i)
            i++;
        } else {
            data = buffer.readUInt8(i);
        }

        let dest_asm = reg_map[w][reg];

        console.log(`mov ${dest_asm}, ${data}`)
        continue;
    }
}
