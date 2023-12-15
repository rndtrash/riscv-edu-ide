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

export function DecodeInstruction(instruction: number): IRv32RInstruction | IRv32IInstruction | undefined {
    const opcode: Rv32OpCodes = instruction & 0b1111111;
    VerifyOpcode(opcode);

    switch (opcode) {
        case Rv32OpCodes.OP_IMM:
            return {
                opcode: opcode,
                rd: (instruction >> 7) & 0b1111,
                funct3: (instruction >> (7 + 4)) & 0b111,
                rs1: (instruction >> (7 + 4 + 3)) & 0b1111,
                imm: (instruction >> (7 + 4 + 3 + 4)) & 0b11_1111_1111_1111,
            } as IRv32IInstruction;

        case Rv32OpCodes.LOAD:
            return {
                opcode: opcode,
                rd: (instruction >> 7) & 0b1111,
                funct3: (instruction >> (7 + 4)) & 0b111,
                rs1: (instruction >> (7 + 4 + 3)) & 0b1111,
                rs2: (instruction >> (7 + 4 + 3 + 4)) & 0b1111,
                funct7: (instruction >> (7 + 4 + 3 + 4 + 4)) & 0b1111111,
            } as IRv32RInstruction;
    }

    return undefined;
}

enum Rv32CPUState {
    Read,
    Execute
}

enum Rv32IOState {
    Read,
    Noop
}

export class Rv32CPU extends Master<number, number> {
    public svelteComponent: ComponentType | undefined = DeviceVisualRv32;

    protected _registers: number[] = new Array<number>(32);
    protected _ip: number = 0;
    protected _state: Rv32CPUState = Rv32CPUState.Read;

    protected _ioState: Rv32IOState = Rv32IOState.Read;
    protected _ioOp1: number = 0;
    protected _ioOp2: number = 0;

    constructor() {
        super();

        for (let i = 0; i < this._registers.length; i++)
            this._registers[i] = 0;
    }

    protected setRegister(index: number, value: number): void {
        if (index != 0)
            this._registers[index] = value;
    }

    protected DeviceTick(tick: number): void {
        console.log("rv32: tick");
        switch (this._state) {
            case Rv32CPUState.Read:
                const instruction = DecodeInstruction(this._ioOp2);
                console.log(instruction);
                if (instruction === undefined) {
                    console.error(`rv32: invalid instruction ${instruction}`);
                    return;
                }

                switch (instruction.opcode) {
                    case Rv32OpCodes.OP_IMM:
                        const op_imm = instruction as IRv32IInstruction;
                        switch (op_imm.funct3) {
                            case 0b000: // ADDI
                                console.log(`rv32: ADDI r${op_imm.rd} = r${op_imm.rs1} + 0x${op_imm.imm.toString(16)}`);
                                this.setRegister(op_imm.rd, this._registers[op_imm.rs1] + op_imm.imm);
                                break;

                            default:
                                console.error(`rv32: unknown R funct3 ${op_imm.funct3}`);
                        }

                        this._ip += 4;

                        this._ioOp1 = this._ip;
                        this._ioState = Rv32IOState.Read;
                        this._state = Rv32CPUState.Read;
                        break;

                    default:
                        console.error(`unknown opcode ${instruction.opcode}`);
                        break;
                }
                break;

            default:
                console.error(`rv32: unhandled state ${this._state}`)
        }
    }

    protected MasterIO(ioTick: number): void {
        switch (this._ioState) {
            case Rv32IOState.Read: {
                const read = this.bus.Read(ioTick, this._ioOp1);
                if (read === undefined) {
                    console.error(`rv32: no response @ 0x${this._ioOp1.toString(16).padStart(8, "0")}`);
                    this._ioOp2 = 0;
                    break;
                }
                this._ioOp2 = read;

                break;
            }

            case Rv32IOState.Noop:
                break;

            default:
                console.error(`rv32: unhandled io state ${this._ioState}`);
        }
    }

    public serialize(): { name: string; context: any } {
        return {name: RISCV32_NAME, context: undefined};
    }

    public getState(): IRv32State {
        return {
            registers: Array.from<number>(this._registers)
        }
    }
}

MasterBusMasterRegistry[RISCV32_NAME] = () => new Rv32CPU();