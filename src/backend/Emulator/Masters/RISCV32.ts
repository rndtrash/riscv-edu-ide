import { Master, MasterBusMasterRegistry } from "src/backend/Emulator/Bus";
import { v4 } from "uuid";
import { IRv32IInstruction, IRv32Instruction, IRv32JInstruction, IRv32RInstruction, IRv32SInstruction, Rv32Funct3Op, Rv32Funct3OpImm, Rv32Funct3Store, Rv32Funct7Op, Rv32OpCodes, VerifyOpcode } from "src/backend/Assembler/Instructions";

const RISCV32_NAME: string = "rv32";
export const RV32_REGISTERS_COUNT = 32;

export interface IRv32State {
    registers: number[];
    ip: number;
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
            return {
                opcode: opcode,
                funct3: (instruction >> (7 + 5)) & 0b111,
                rs1: (instruction >> (7 + 5 + 3)) & 0b1_1111,
                rs2: (instruction >> (7 + 5 + 3 + 5)) & 0b1_1111,
                imm: ((instruction >> 7) & 0b1_1111) | (((instruction >> (7 + 5 + 3 + 5 + 5)) & 0b111_1111) << 5),
            } as IRv32SInstruction;

        case Rv32OpCodes.JAL: {
            const immShuffled = instruction >> 7;
            return {
                opcode: opcode,
                rd: (instruction >> 7) & 0b1_1111,
                // imm[19|9:0|10|18:11]
                imm: (((immShuffled >> 19) & 0b1) << (10 + 1 + 8))
                    | ((immShuffled & 0b1111_1111) << (10 + 1))
                    | (((immShuffled >> 10) & 0b1) << 10)
                    | ((immShuffled >> 9) & 0b11_1111_1111)
            } as IRv32JInstruction;
        }
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
    protected _dataView: DataView;

    public getRegister(n: number): number {
        if (n === 0)
            return 0;

        if (n < 0 || n >= 32) throw "Too many registers";

        return this._dataView.getUint32(4 + 4 + 4 + 4 + 4 + 4 + n * 4);
    }

    protected setRegister(n: number, v: number) {
        if (n === 0)
            return;

        if (n < 0 || n >= 32) throw "Too many registers";

        this._dataView.setUint32(4 + 4 + 4 + 4 + 4 + 4 + n * 4, v);
    }

    protected get _ip(): number {
        return this._dataView.getUint32(0);
    }

    protected set _ip(value: number) {
        this._dataView.setUint32(0, value);
    }

    protected get _state(): Rv32CPUState {
        return this._dataView.getUint32(4) as Rv32CPUState;
    }

    protected set _state(value: Rv32CPUState) {
        this._dataView.setUint32(4, value as number);
    }

    protected get _op1(): number {
        return this._dataView.getUint32(4 + 4);
    }

    protected set _op1(value: number) {
        this._dataView.setUint32(4 + 4, value);
    }

    protected get _ioState(): Rv32IOState {
        return this._dataView.getUint32(4 + 4 + 4) as Rv32IOState;
    }

    protected set _ioState(value: Rv32IOState) {
        this._dataView.setUint32(4 + 4 + 4, value as number);
    }

    protected get _ioOp1(): number {
        return this._dataView.getUint32(4 + 4 + 4 + 4);
    }

    protected set _ioOp1(value: number) {
        this._dataView.setUint32(4 + 4 + 4 + 4, value);
    }

    protected get _ioOp2(): number {
        return this._dataView.getUint32(4 + 4 + 4 + 4 + 4);
    }

    protected set _ioOp2(value: number) {
        this._dataView.setUint32(4 + 4 + 4 + 4 + 4, value);
    }

    public static fromContext<Address, Data>(context: any, uuid?: string): Rv32CPU {
        const rv32 = new Rv32CPU();

        rv32.uuid = uuid ?? v4();
        rv32.state = new SharedArrayBuffer(4 + 4 + 4 + 4 + 4 + 4 + 32 * 4);
        rv32._dataView = new DataView(rv32.state);

        rv32.init();

        return rv32;
    }

    public static fromBuffer<Address, Data>(state: SharedArrayBuffer, uuid: string): Rv32CPU {
        const rv32 = new Rv32CPU();

        rv32.uuid = uuid;
        rv32.state = state;
        rv32._dataView = new DataView(rv32.state);

        return rv32;
    }

    protected init(): void {
        for (let i = 0; i < RV32_REGISTERS_COUNT; i++)
            this.setRegister(i, 0);
    }

    public get info(): { name: string; uuid: string; } {
        return { name: RISCV32_NAME, uuid: this.uuid };
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
                                this.setRegister(op_imm.rd, this.getRegister(op_imm.rs1) + op_imm.imm);
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
                                        this.setRegister(op.rd, this.getRegister(op.rs1) + this.getRegister(op.rs2));
                                        break;

                                    case Rv32Funct7Op.SUB:
                                        console.log(`rv32: SUB r${op.rd} = r${op.rs1} - r${op.rs2}`);
                                        this.setRegister(op.rd, this.getRegister(op.rs1) - this.getRegister(op.rs2));
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
                                this._ioOp1 = this.getRegister(store.rs1) + offset;
                                this._ioOp2 = this.getRegister(store.rs2);
                                this._state = Rv32CPUState.Noop;
                                break;

                            default:
                                console.error(`rv32: unknown S funct3 ${store.funct3}`);
                        }
                        break;
                    }

                    case Rv32OpCodes.JAL: {
                        const jal = instruction as IRv32JInstruction;
                        const offset = signExtend(jal.imm, 20);
                        console.log(`rv32: JAL r${jal.rd} = 0x${(this._ip + 4).toString(16)}`);
                        this.setRegister(jal.rd, this._ip + 4);
                        console.log(`rv32: JAL ip = 0x${(this._ip + offset).toString(16)}`);
                        this.nextInstruction(this._ip + offset);
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
                if (read == null) {
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

    public serialize(): { name: string; uuid: string; context: any } {
        return { name: RISCV32_NAME, uuid: this.uuid, context: undefined };
    }

    public getState(): IRv32State {
        return {
            registers: [...Array(RV32_REGISTERS_COUNT).keys()].map((i) => this.getRegister(i)),
            ip: this._ip
        }
    }
}

MasterBusMasterRegistry.set(RISCV32_NAME, {
    fromContext(context: any, uuid: string = v4()) {
        return Rv32CPU.fromContext(context, uuid);
    },
    fromBuffer(state, uuid) {
        return Rv32CPU.fromBuffer(state, uuid);
    },
});