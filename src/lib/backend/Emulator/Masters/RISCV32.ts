import {Master, MasterBusMasterRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";
import DeviceVisualRv32 from "$lib/device-visuals/DeviceVisualRv32.svelte";

const RISCV32_NAME: string = "rv32";

export interface IRv32State {
    registers: number[]
}

// RISC-V Spec v2.2, RV32I Base Instruction Set (page 104)
export enum Rv32OpCodes {
    LUI = 0b0110111,
    AUIPC = 0b0010111,
    JAL = 0b1101111,
    JALR = 0b1100111,
    BEQ = 0b1100011,
    BNE = 0b1100011,
    BLT = 0b1100011,
    BGE = 0b1100011,
    BLTU = 0b1100011,
    BGEU = 0b1100011,
    LB = 0b0000011,
    LH = 0b0000011,
    LW = 0b0000011,
    LBU = 0b0000011,
    LHU = 0b0000011,
    SB = 0b0100011,
    SH = 0b0100011,
    SW = 0b0100011,
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
    FENCE = 0b0001111,
    FENCE_I = 0b0001111,
    ECALL = 0b1110011,
    EBREAK = 0b1110011,
    CSRRW = 0b1110011,
    CSRRS = 0b1110011,
    CSRRC = 0b1110011,
    CSRRWI = 0b1110011,
    CSRRSI = 0b1110011,
    CSRRCI = 0b1110011,
}

enum Rv32Funct3OpImm {
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

enum Rv32Funct3Op {
    ADD = 0b000,
    SUB = 0b000,
    SLL = 0b001,
    SLT = 0b010,
    SLTU = 0b011,
    XOR = 0b100,
    SRL = 0b101,
    SRA = 0b101,
    OR = 0b110,
    AND = 0b111,
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

function VerifyOpcode(opcode: number) {
    console.assert(opcode < 128);
    // 32-bit instruction's first 5 bits: bbb11 (where bbb != 111) (page 6)
    console.assert((opcode & 0b11100) != 0b11100);
}

function VerifyRInstruction(i: IRv32RInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 16);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 16);
    console.assert(i.rs2 < 16);
    console.assert(i.funct7 < 128);
}

function VerifyIInstruction(i: IRv32IInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 16);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 16);
    console.assert(i.imm < 4096);
}

function MakeRInstruction(i: IRv32RInstruction): number {
    VerifyRInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        | i.funct3 << (7 + 4)
        | i.rs1 << (7 + 4 + 3)
        | i.rs2 << (7 + 4 + 3 + 4)
        | i.funct7 << (7 + 4 + 3 + 4 + 4)
    );
}

export function MakeADD(firstRegister: number, secondRegister: number, destinationRegister: number): number {
    return MakeRInstruction({
        opcode: Rv32OpCodes.OP,
        rd: destinationRegister,
        funct3: Rv32Funct3Op.ADD,
        rs1: firstRegister,
        rs2: secondRegister,
        funct7: 0b0000000
    });
}

export function MakeSUB(firstRegister: number, secondRegister: number, destinationRegister: number): number {
    return MakeRInstruction({
        opcode: Rv32OpCodes.OP,
        rd: destinationRegister,
        funct3: Rv32Funct3Op.SUB,
        rs1: firstRegister,
        rs2: secondRegister,
        funct7: 0b0100000
    });
}

function MakeIInstruction(i: IRv32IInstruction): number {
    VerifyIInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        | i.funct3 << (7 + 4)
        | i.rs1 << (7 + 4 + 3)
        | i.imm << (7 + 4 + 3 + 4)
    );
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

export class Rv32CPU extends Master<number, number> {
    public svelteComponent: ComponentType | undefined = DeviceVisualRv32;

    protected _registers: number[] = new Array<number>(32);

    constructor() {
        super();

        for (let i = 0; i < this._registers.length; i++)
            this._registers[i] = 0;
    }

    protected DeviceTick(tick: number): void {
        console.log("rv32: tick");
    }

    protected MasterIO(ioTick: number): void {
        this.bus.Read(ioTick, 0);
    }

    public serialize(): { name: string; context: any } {
        return {name: RISCV32_NAME, context: undefined};
    }

    getState(): IRv32State {
        return {
            registers: Array.from<number>(this._registers)
        }
    }
}

MasterBusMasterRegistry[RISCV32_NAME] = () => new Rv32CPU();