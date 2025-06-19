// RISC-V Spec v2.2, RV32I Base Instruction Set (page 104)
export enum Rv32OpCodes {
    LUI = 0b0110111,
    AUIPC = 0b0010111,
    JAL = 0b1101111,
    JALR = 0b1100111,
    // BEQ = 0b1100011,
    // BNE = 0b1100011,
    // BLT = 0b1100011,
    // BGE = 0b1100011,
    // BLTU = 0b1100011,
    // BGEU = 0b1100011,
    BRANCH = 0b1100011,
    // LB = 0b0000011,
    // LH = 0b0000011,
    // LW = 0b0000011,
    // LBU = 0b0000011,
    // LHU = 0b0000011,
    LOAD = 0b0000011,
    // SB = 0b0100011,
    // SH = 0b0100011,
    // SW = 0b0100011,
    STORE = 0b0100011,
    // ADDI = 0b0010011,
    // SLTI = 0b0010011,
    // SLTIU = 0b0010011,
    // XORI = 0b0010011,
    // ORI = 0b0010011,
    // ANDI = 0b0010011,
    // SLLI = 0b0010011,
    // SRLI = 0b0010011,
    // SRAI = 0b0010011,
    OP_IMM = 0b0010011,
    // ADD = 0b0110011,
    // SUB = 0b0110011,
    // SLL = 0b0110011,
    // SLT = 0b0110011,
    // SLTU = 0b0110011,
    // XOR = 0b0110011,
    // SRL = 0b0110011,
    // SRA = 0b0110011,
    // OR = 0b0110011,
    // AND = 0b0110011,
    OP = 0b0110011,
    // FENCE = 0b0001111,
    // FENCE_I = 0b0001111,
    MISC_MEM = 0b0001111,
    // ECALL = 0b1110011,
    // EBREAK = 0b1110011,
    // CSRRW = 0b1110011,
    // CSRRS = 0b1110011,
    // CSRRC = 0b1110011,
    // CSRRWI = 0b1110011,
    // CSRRSI = 0b1110011,
    // CSRRCI = 0b1110011,
    SYSTEM = 0b1110011,
}

export enum Rv32Funct3OpImm {
    ADDI = 0b000,
    SLTI = 0b010,
    SLTIU = 0b011,
    XORI = 0b100,
    ORI = 0b110,
    ANDI = 0b111,
    SLLI = 0b001,
    SRLI = 0b101,
    SRAI = 0b101,
}

export enum Rv32Funct3Op {
    ADDSUB = 0b000,
    SLL = 0b001,
    SLT = 0b010,
    SLTU = 0b011,
    XOR = 0b100,
    SRLSRA = 0b101,
    OR = 0b110,
    AND = 0b111,
}

export enum Rv32Funct3Store {
    // 1 byte
    BYTE = 0b000,
    // 2 bytes
    HALF = 0b001,
    // 4 bytes
    WORD = 0b010
}

export enum Rv32Funct7Op {
    ADD = 0b0000000,
    SUB = 0b0100000,
}

export interface IRv32RInstruction {
    opcode: Rv32OpCodes;
    rd: number;
    funct3: number;
    rs1: number;
    rs2: number;
    funct7: number;
}

export interface IRv32IInstruction {
    opcode: Rv32OpCodes;
    rd: number;
    funct3: number;
    rs1: number;
    imm: number;
}

export interface IRv32SInstruction {
    opcode: Rv32OpCodes;
    funct3: number;
    rs1: number;
    rs2: number;
    imm: number;
}

export interface IRv32JInstruction {
    opcode: Rv32OpCodes;
    rd: number;
    imm: number;
}

export type IRv32Instruction = IRv32RInstruction | IRv32IInstruction | IRv32SInstruction | IRv32JInstruction;

export function VerifyOpcode(opcode: number) {
    console.assert(opcode < 128);
    // 32-bit instruction's first 5 bits: bbb11 (where bbb != 111) (page 6)
    console.assert((opcode & 0b11100) != 0b11100);
}

export function VerifyRInstruction(i: IRv32RInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 32);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.rs2 < 32);
    console.assert(i.funct7 < 128);
}

export function VerifyIInstruction(i: IRv32IInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 32);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.imm < 4096);
}

export function VerifySInstruction(i: IRv32SInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.rs2 < 32);
    console.assert(i.imm < 4096);
}

export function VerifyJInstruction(i: IRv32JInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 32);
    console.assert(i.imm < 1048576);
}

export function MakeRInstruction(i: IRv32RInstruction): number {
    VerifyRInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        | i.funct3 << (7 + 5)
        | i.rs1 << (7 + 5 + 3)
        | i.rs2 << (7 + 5 + 3 + 5)
        | i.funct7 << (7 + 5 + 3 + 5 + 5)
    );
}

export function MakeIInstruction(i: IRv32IInstruction): number {
    VerifyIInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        | i.funct3 << (7 + 5)
        | i.rs1 << (7 + 5 + 3)
        | i.imm << (7 + 5 + 3 + 5)
    );
}

export function MakeSInstruction(i: IRv32SInstruction): number {
    VerifySInstruction(i);

    return (
        i.opcode
        | (i.imm & 0b1_1111) << 7
        | i.funct3 << (7 + 5)
        | i.rs1 << (7 + 5 + 3)
        | i.rs2 << (7 + 5 + 3 + 5)
        | ((i.imm >> 5) & 0b111_1111) << (7 + 5 + 3 + 5 + 5)
    );
}

export function MakeJInstruction(i: IRv32JInstruction): number {
    VerifyJInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        // imm[19|9:0|10|18:11]
        | ((i.imm >> 11) & 0b1111_1111) << (7 + 5)
        | ((i.imm >> 10) & 0b1) << (7 + 5 + 8)
        | (i.imm & 0b11_1111_1111) << (7 + 5 + 8 + 1)
        | ((i.imm >> 19) & 0b1) << (7 + 5 + 8 + 1 + 10)
    );
}

export function MakeADD(firstRegister: number, secondRegister: number, destinationRegister: number): number {
    return MakeRInstruction({
        opcode: Rv32OpCodes.OP,
        rd: destinationRegister,
        funct3: Rv32Funct3Op.ADDSUB,
        rs1: firstRegister,
        rs2: secondRegister,
        funct7: Rv32Funct7Op.ADD
    });
}

export function MakeSUB(firstRegister: number, secondRegister: number, destinationRegister: number): number {
    return MakeRInstruction({
        opcode: Rv32OpCodes.OP,
        rd: destinationRegister,
        funct3: Rv32Funct3Op.ADDSUB,
        rs1: firstRegister,
        rs2: secondRegister,
        funct7: Rv32Funct7Op.SUB
    });
}

export function MakeADDI(sourceRegister: number, destinationRegister: number, immediate: number): number {
    return MakeIInstruction({
        opcode: Rv32OpCodes.OP_IMM,
        rd: destinationRegister,
        funct3: Rv32Funct3OpImm.ADDI,
        rs1: sourceRegister,
        imm: immediate
    });
}

// A canonical NOP instruction
export function MakeNOP(): number {
    return MakeADDI(0, 0, 0);
}

export function MakeSW(addressRegister: number, valueRegister: number, offset: number): number {
    return MakeSInstruction({
        opcode: Rv32OpCodes.STORE,
        funct3: Rv32Funct3Store.WORD,
        rs1: addressRegister,
        rs2: valueRegister,
        imm: offset
    });
}

export function MakeJAL(destinationRegister: number, offset: number): number {
    return MakeJInstruction({
        opcode: Rv32OpCodes.JAL,
        rd: destinationRegister,
        imm: offset
    });
}

export function MakeJ(offset: number): number {
    return MakeJAL(0, offset);
}