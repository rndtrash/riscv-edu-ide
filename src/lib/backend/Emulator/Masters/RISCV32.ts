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
    ADDSUB = 0b000,
    SLL = 0b001,
    SLT = 0b010,
    SLTU = 0b011,
    XOR = 0b100,
    SRLSRA = 0b101,
    OR = 0b110,
    AND = 0b111,
}

enum Rv32Funct3Store {
    // 1 byte
    BYTE = 0b000,
    // 2 bytes
    HALF = 0b001,
    // 4 bytes
    WORD = 0b010
}

enum Rv32Funct7Op {
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

export type IRv32Instruction = IRv32RInstruction | IRv32IInstruction | IRv32SInstruction;

function VerifyOpcode(opcode: number) {
    console.assert(opcode < 128);
    // 32-bit instruction's first 5 bits: bbb11 (where bbb != 111) (page 6)
    console.assert((opcode & 0b11100) != 0b11100);
}

function VerifyRInstruction(i: IRv32RInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 32);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.rs2 < 32);
    console.assert(i.funct7 < 128);
}

function VerifyIInstruction(i: IRv32IInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.rd < 32);
    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.imm < 4096);
}

function VerifySInstruction(i: IRv32SInstruction) {
    VerifyOpcode(i.opcode);

    console.assert(i.funct3 < 8);
    console.assert(i.rs1 < 32);
    console.assert(i.rs2 < 32);
    console.assert(i.imm < 4096);
}

function MakeRInstruction(i: IRv32RInstruction): number {
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

function MakeIInstruction(i: IRv32IInstruction): number {
    VerifyIInstruction(i);

    return (
        i.opcode
        | i.rd << 7
        | i.funct3 << (7 + 5)
        | i.rs1 << (7 + 5 + 3)
        | i.imm << (7 + 5 + 3 + 5)
    );
}

function MakeSInstruction(i: IRv32SInstruction): number {
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

export function DecodeInstruction(instruction: number): IRv32Instruction | undefined {
    const opcode: Rv32OpCodes = instruction & 0b111_1111;
    VerifyOpcode(opcode);

    switch (opcode) {
        case Rv32OpCodes.LOAD:
        case Rv32OpCodes.OP_IMM:
            return {
                opcode: opcode,
                rd: (instruction >> 7) & 0b1_1111,
                funct3: (instruction >> (7 + 5)) & 0b111,
                rs1: (instruction >> (7 + 5 + 3)) & 0b1_1111,
                imm: (instruction >> (7 + 5 + 3 + 5)) & 0b11_1111_1111_1111,
            } as IRv32IInstruction;

        case Rv32OpCodes.OP:
            return {
                opcode: opcode,
                rd: (instruction >> 7) & 0b1_1111,
                funct3: (instruction >> (7 + 5)) & 0b111,
                rs1: (instruction >> (7 + 5 + 3)) & 0b1_1111,
                rs2: (instruction >> (7 + 5 + 3 + 5)) & 0b1_1111,
                funct7: (instruction >> (7 + 5 + 3 + 5 + 5)) & 0b111_1111,
            } as IRv32RInstruction;

        case Rv32OpCodes.STORE:
            console.log(`STORE DEBUG ${(instruction >> (7 + 5 + 3)) & 0b1_1111} ${(instruction >> (7 + 5 + 3 + 5)) & 0b1_1111}`);
            return {
                opcode: opcode,
                funct3: (instruction >> (7 + 5)) & 0b111,
                rs1: (instruction >> (7 + 5 + 3)) & 0b1_1111,
                rs2: (instruction >> (7 + 5 + 3 + 5)) & 0b1_1111,
                imm: ((instruction >> 7) & 0b1_1111) | (((instruction >> (7 + 5 + 3 + 5 + 5)) & 0b111_1111) << 5),
            } as IRv32SInstruction;
    }

    return undefined;
}

function signExtend(n: number, bits: number): number {
    const sign = n >> (bits - 1);
    if (sign != 0) {
        n = ~n + 1;
    }
    return n;
}

enum Rv32CPUState {
    Read,
    StoreToReg,
    StoreFromReg,
    Noop
}

enum Rv32IOState {
    Read,
    Write,
    Noop
}

export class Rv32CPU extends Master<number, number> {
    public svelteComponent: ComponentType | undefined = DeviceVisualRv32;

    protected _registers: number[] = new Array<number>(32);
    protected _ip: number = 0;

    protected _state: Rv32CPUState = Rv32CPUState.Read;
    protected _op1: number = 0;

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

    protected nextInstruction(nextAddress?: number): void {
        if (nextAddress === undefined)
            this._ip += 4;
        else
            this._ip = nextAddress;

        this._ioOp1 = this._ip;
        this._ioState = Rv32IOState.Read;
        this._state = Rv32CPUState.Read;
    }

    protected DeviceTick(tick: number): void {
        console.log("rv32: tick");
        switch (this._state) {
            case Rv32CPUState.Read:
                const instruction = DecodeInstruction(this._ioOp2);
                if (instruction === undefined) {
                    console.error(`rv32: invalid instruction ${this._ioOp2}`);
                    return;
                }
                console.log(instruction);

                switch (instruction.opcode) {
                    case Rv32OpCodes.OP_IMM: {
                        const op_imm = instruction as IRv32IInstruction;
                        switch (op_imm.funct3) {
                            case Rv32Funct3OpImm.ADDI:
                                console.log(`rv32: ADDI r${op_imm.rd} = r${op_imm.rs1} + 0x${op_imm.imm.toString(16)}`);
                                this.setRegister(op_imm.rd, this._registers[op_imm.rs1] + op_imm.imm);
                                break;

                            default:
                                console.error(`rv32: unknown I funct3 ${op_imm.funct3}`);
                        }

                        this.nextInstruction();
                        break;
                    }

                    case Rv32OpCodes.OP: {
                        const op = instruction as IRv32RInstruction;
                        switch (op.funct3) {
                            case Rv32Funct3Op.ADDSUB: {
                                switch (op.funct7) {
                                    case Rv32Funct7Op.ADD:
                                        console.log(`rv32: ADD r${op.rd} = r${op.rs1} + r${op.rs2}`);
                                        this.setRegister(op.rd, this._registers[op.rs1] + this._registers[op.rs2]);
                                        break;

                                    case Rv32Funct7Op.SUB:
                                        console.log(`rv32: SUB r${op.rd} = r${op.rs1} - r${op.rs2}`);
                                        this.setRegister(op.rd, this._registers[op.rs1] - this._registers[op.rs2]);
                                        break;

                                    default:
                                        console.error(`rv32: unknown R funct7 ${op.funct7}`);
                                        break;
                                }
                                break;
                            }

                            default:
                                console.error(`rv32: unknown R funct3 ${op.funct3}`);
                                break;
                        }

                        this.nextInstruction();
                        break;
                    }

                    case Rv32OpCodes.LOAD:
                        console.error(`not implemented ${instruction.opcode}`);
                        break;

                    case Rv32OpCodes.STORE: {
                        const store = instruction as IRv32SInstruction;
                        const offset = signExtend(store.imm, 12);
                        switch (store.funct3) {
                            case Rv32Funct3Store.WORD:
                                console.log(`rv32: SW m[r${store.rs1} + 0x${offset.toString(16)}] = r${store.rs2}`);
                                this._ioState = Rv32IOState.Write;
                                this._ioOp1 = this._registers[store.rs1] + offset;
                                this._ioOp2 = this._registers[store.rs2];
                                this._state = Rv32CPUState.Noop;
                                break;

                            default:
                                console.error(`rv32: unknown S funct3 ${store.funct3}`);
                        }
                        break;
                    }

                    default:
                        console.error(`unknown opcode ${instruction.opcode}`);
                        break;
                }
                break;

            case Rv32CPUState.StoreToReg:
                console.error(`not implemented ${Rv32CPUState[this._state]}`);
                break;

            case Rv32CPUState.StoreFromReg:
                this.nextInstruction();
                break;

            case Rv32CPUState.Noop:
                break;

            default:
                console.error(`rv32: unhandled state ${Rv32CPUState[this._state]}`);
                break;
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
                this._ioState = Rv32IOState.Noop;

                break;
            }

            case Rv32IOState.Write: {
                if (this._ioOp1 % 4 == 0) {
                    this.bus.Write(ioTick, this._ioOp1, this._ioOp2);
                } else {
                    console.error(`rv32: not implemented unaligned access @ 0x${this._ioOp1.toString(16).padStart(8, "0")}`);
                }
                this._ioState = Rv32IOState.Noop;
                this._state = Rv32CPUState.StoreFromReg;
                break;
            }

            case Rv32IOState.Noop:
                break;

            default:
                console.error(`rv32: unhandled io state ${Rv32IOState[this._ioState]}`);
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