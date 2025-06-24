import { IRv32Instruction, MakeADDI, MakeJAL } from "./Instructions";
import { NewLine, Comment, Token, Dot, Literal, Space, NumberToken, Colon, Comma } from "./Tokenizer";

function skipStuff(tokens: Token[]) {
    while (tokens.length > 0) {
        const currentToken = tokens[0];
        if (!(currentToken instanceof Comment) && !(currentToken instanceof NewLine) && !(currentToken instanceof Space))
            break;
        tokens.shift();
    }
}

function readDirective(tokens: Token[]): { type: "offset", number: number } | null {
    if (tokens.length < 2) return null;
    if (!(tokens[0] instanceof Dot)) return null;
    if (!(tokens[1] instanceof Literal)) return null;

    tokens.shift();

    const literalName = tokens.shift() as Literal;
    switch (literalName.value) {
        case "offset":
            {
                if (!(tokens.shift() instanceof Space)) return null;
                const offset = tokens.shift();
                if (!(offset instanceof NumberToken)) return null;
                return { type: "offset", number: (offset as NumberToken).value };
            }
            break;

        default:
            throw `Unknown directive: ${literalName}`;
    }
}

function readLabel(tokens: Token[]): string | null {
    if (tokens.length < 2) return null;
    if (!(tokens[0] instanceof Literal)) return null;
    if (!(tokens[1] instanceof Colon)) return null;

    const label = tokens.shift() as Literal;
    tokens.shift();

    return label.value;
}

const AbiRegisterNames = new Map<string, number>([
    ["zero", 0],
    ["ra", 1],
    ["rs", 2],
    ["gp", 3],
    ["tp", 4],
    ["t0", 5],
    ["t1", 6],
    ["t2", 7],
    ["s0", 8],
    ["fp", 8],
    ["s1", 9],
    ["a0", 10],
    ["a1", 11],
    ["a2", 12],
    ["a3", 13],
    ["a4", 14],
    ["a5", 15],
    ["a6", 16],
    ["a7", 17],
    ["s2", 18],
    ["s3", 19],
    ["s4", 20],
    ["s5", 21],
    ["s6", 22],
    ["s7", 23],
    ["s8", 24],
    ["s9", 25],
    ["s10", 26],
    ["s11", 27],
    ["t3", 28],
    ["t4", 29],
    ["t5", 30],
    ["t6", 31]
]);

function readRegister(tokens: Token[]): number | null {
    if (tokens.length < 1) return null;
    if (!(tokens[0] instanceof Literal)) return null;

    const registerName = (tokens.shift() as Literal).value.toLowerCase();
    if (registerName.startsWith("x")) {
        const n = parseInt(registerName.substring(1));
        if (Number.isNaN(n) || n < 0 || n > 31) return null;

        return n;
    }

    if (AbiRegisterNames.has(registerName)) return AbiRegisterNames.get(registerName);

    return null;
}

function readNumber(tokens: Token[]): number | null {
    if (tokens.length < 1) return null;
    if (!(tokens[0] instanceof NumberToken)) return null;

    return (tokens.shift() as NumberToken).value;
}

function readComma(tokens: Token[]): boolean | null {
    if (tokens.length < 1) return null;
    if (!(tokens[0] instanceof Comma)) return null;

    tokens.shift();
    return true;
}

function readLabelOrNumber(tokens: Token[]): string | number | null {
    if (tokens.length < 1) return null;
    if (tokens[0] instanceof NumberToken) return (tokens.shift() as NumberToken).value;
    if (tokens[0] instanceof Literal) return (tokens.shift() as Literal).value;

    return null;
}

const InstructionTable = new Map<string, ((tokens: Token[]) => any)[]>([
    ["addi", [readRegister, readRegister, readNumber]],
    ["ret", []],
    ["jal", [readRegister, readLabelOrNumber]]
]);

function readInstruction(tokens: Token[]): any[] | null {
    if (tokens.length < 1) return null;
    if (!(tokens[0] instanceof Literal)) return null;
    const instructionName = (tokens.shift() as Literal).value.toLowerCase();
    if (!InstructionTable.has(instructionName)) throw `Invalid instruction: ${instructionName}`;

    const argumentsToGet = [...InstructionTable.get(instructionName)];
    const argumentCount = argumentsToGet.length;
    const instructionArguments: any[] = [];
    while (argumentsToGet.length > 0) {
        skipStuff(tokens);
        if (argumentsToGet.length !== argumentCount && !readComma(tokens)) {
            throw `Didn't find a comma for instruction ${instructionName}`;
        }
        skipStuff(tokens);

        const f = argumentsToGet.shift();
        const val = f(tokens);
        if (val === null) throw `Cannot read argument ${f} of instruction ${instructionName}`;

        instructionArguments.push(val);
    }

    return [instructionName, ...instructionArguments];
}

function doAssembly(tokens: Token[], result: ArrayBuffer, labelPositions: Map<string, number>, dryRun: boolean = false) {
    const dv = new DataView(result);

    // Offset of instructions, always multiple of 4
    let currentOffset = 0;
    let resultOffset = 0;
    while (tokens.length > 0) {
        skipStuff(tokens);

        // Get the whole line
        const lineTokens = [];
        while (tokens.length > 0 && !(tokens[0] instanceof NewLine)) {
            lineTokens.push(tokens.shift());
        }

        do {
            let directive;
            if ((directive = readDirective(lineTokens)), directive !== null) {
                console.log(`Change offset to ${directive.number}`);
                console.assert(directive.number >= 0);
                currentOffset = directive.number;
                break;
            }

            let labelName: string | null = null;
            while ((labelName = readLabel(lineTokens)), labelName !== null) {
                console.log(`found label ${labelName} @ ${currentOffset}`);
                if (dryRun) {
                    if (labelPositions.has(labelName)) throw `Label ${labelName} already exists`;
                    labelPositions.set(labelName, currentOffset);
                }
                skipStuff(lineTokens);
            }

            let instruction: any[] | null = null;
            if ((instruction = readInstruction(lineTokens)), instruction !== null) {
                console.log(`found instruction: ${instruction}`);
                if (!dryRun) result.resize(result.byteLength + 4);
                let instructionBytes: number;
                switch (instruction[0]) {
                    case "addi":
                        {
                            instructionBytes = MakeADDI(instruction[1], instruction[2], instruction[3]);
                        }
                        break;

                    case "jal":
                        {
                            let jumpOffset = 0;
                            if (typeof instruction[2] === "number") jumpOffset = instruction[2];
                            else if (typeof instruction[2] === "string") {
                                const labelName = String(instruction[2]);
                                if (!labelPositions.has(labelName)) throw `Cannot find label ${labelName}`;

                                jumpOffset = labelPositions.get(labelName) - currentOffset;
                            } else {
                                throw `JAL: unknown argument type ${typeof instruction[2]}`;
                            }
                            instructionBytes = MakeJAL(instruction[1], jumpOffset);
                        }
                        break;

                    default:
                        throw `Cannot handle instruction ${instruction[0]}`;
                }
                if (!dryRun) dv.setUint32(resultOffset, instructionBytes, true);
                resultOffset += 4;
                currentOffset += 4;
            }
        } while (false);

        skipStuff(lineTokens);

        if (lineTokens.length > 0) {
            throw `No tokens were consumed on this round: ${JSON.stringify(lineTokens)}`;
        }
    }
}

export function assemble(tokens: Token[]): Uint8Array {
    const result = new ArrayBuffer(0, { maxByteLength: 256 });

    let labelPositions = new Map<string, number>();
    // Dry run to mark all the labels
    doAssembly([...tokens], result, labelPositions, true);
    doAssembly([...tokens], result, labelPositions);

    return new Uint8Array(result);
}