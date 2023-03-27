import { readFileSync } from "fs";

const [, , input_path] = process.argv;

const buffer = readFileSync(input_path);

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

const rm_map = {
    "000": "bx + si",
    "001": "bx + di",
    "010": "bp + si",
    "011": "bp + di",
    "100": "si",
    "101": "di",
    "110": "bp", // except when mod = 00, then 16bit disp follows.
    "111": "bx",
};

let d, // "direction", 1 = reg is dest, 0 = reg is source.
    w, // "word", i.e. 16bit
    mod, // reg2reg, reg2mem, mem2mem, mem2reg, etc.
    reg, // reg address
    rm, // reg/mem address
    data;

console.log("bits 16");

for (let i = 0; i < buffer.length; i++) {
    let byte = buffer.readUInt8(i);
    let bits = byte.toString(2).padStart(8, "0");

    // register/memory to/from register
    if (bits.slice(0, 6) === "100010") {
        d = bits[6];
        w = bits[7];
        i++;
        byte = buffer.readUInt8(i);
        bits = byte.toString(2).padStart(8, "0");
        mod = bits.slice(0, 2);
        reg = bits.slice(2, 5);
        rm = bits.slice(5, 8);

        const reg_address = reg_map[w][reg];

        switch (mod) {
            // register mode
            case "11":
                const rm_reg_address = reg_map[w][rm];
                if (d === "1") {
                    console.log(`mov ${reg_address}, ${rm_reg_address}`);
                } else {
                    console.log(`mov ${rm_reg_address}, ${reg_address}`);
                }
                continue;
                break;
            // memory mode
            default:
                // TODO: displacement exception for mod = 00 and rm = 110
                let mem_address = rm_map[rm];

                if (mod === "01") { // 8bit displacement
                    i++;
                    data = buffer.readUInt8(i);
                    mem_address += ` + ${data}`;
                } else if (mod === "10") {// 16bit displacement
                    i++;
                    data = buffer.readUInt16LE(i);
                    i++;
                    mem_address += ` + ${data}`;
                }

                if (d === "1") {
                    console.log(`mov ${reg_address}, [${mem_address}]`);
                } else {
                    // TODO: last test in listing 39 not printing.
                    console.log(`mov [${mem_address}], ${reg_address}`);
                }
                continue;
                break;
        }
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

        const reg_address = reg_map[w][reg];

        console.log(`mov ${reg_address}, ${data}`)
        continue;
    }
}
