import {Master, MasterBusMasterRegistry} from "src/backend/Emulator/Bus";
import {v4} from "uuid";

enum CPUState {
    ReadInstruction,
    ProcessInstruction,
    ReadWordFromRAM,
    ReadWordFromRAMStage2,
    WriteWordToRAM
}

export enum CPUInstructions {
    Noop,
    LoadImmediate,
    AddToRegister,
    StoreAtAddress,
    LoadFromAddress
}

const SIMPLECPU_NAME: string = "simplecpu";

export interface ISimpleCPUState {
    state: string;
    ip: number;
    register: number;
}

export class SimpleCPU extends Master<number, number> {
    public svelteComponent: any | null = null;

    private ip: number = 0;
    private dataRq: number = 0;
    private dword: number = 0;
    private state: CPUState = 0;

    private currentInstruction: CPUInstructions = 0;
    private register: number = 0;

    protected DeviceTick(tick: number): void {
        console.log(`scpu: tick, state ${CPUState[this.state]}`);

        switch (this.state) {
            case CPUState.ReadInstruction:
                break;

            case CPUState.ProcessInstruction:
                this.currentInstruction = this.dword
                switch (this.currentInstruction) {
                    case CPUInstructions.Noop:
                        console.log("scpu: noop");
                        this.ip += 4;
                        this.state = CPUState.ReadInstruction;
                        break;

                    case CPUInstructions.LoadImmediate:
                    case CPUInstructions.AddToRegister:
                    case CPUInstructions.StoreAtAddress:
                    case CPUInstructions.LoadFromAddress:
                        this.state = CPUState.ReadWordFromRAM;
                        this.dataRq = this.ip + 4;
                        break;

                    default:
                        throw `Unhandled instruction ${this.currentInstruction}`;
                }
                break;

            case CPUState.ReadWordFromRAM:
                switch (this.currentInstruction) {
                    case CPUInstructions.LoadImmediate:
                        this.register = this.dword;
                        this.ip += 8;
                        this.state = CPUState.ReadInstruction;
                        break;

                    case CPUInstructions.AddToRegister:
                        this.register += this.dword;
                        this.ip += 8;
                        this.state = CPUState.ReadInstruction;
                        break;

                    case CPUInstructions.StoreAtAddress:
                        this.dataRq = this.dword;
                        this.state = CPUState.WriteWordToRAM;
                        break;

                    case CPUInstructions.LoadFromAddress:
                        this.dataRq = this.dword;
                        this.state = CPUState.ReadWordFromRAMStage2;
                        break;
                }
                break;

            case CPUState.ReadWordFromRAMStage2:
                switch (this.currentInstruction) {
                    case CPUInstructions.LoadFromAddress:
                        this.register = this.dword;
                        this.state = CPUState.ReadInstruction;
                        this.ip += 8;
                        break;
                }
                break;

            case CPUState.WriteWordToRAM:
                switch (this.currentInstruction) {
                    case CPUInstructions.StoreAtAddress:
                        this.ip += 8;
                        this.state = CPUState.ReadInstruction;
                        break;
                }
                break;
        }

        console.log(`scpu: state: reg=${this.register}`);
    }

    protected MasterIO(ioTick: number): void {
        switch (this.state) {
            case CPUState.ReadInstruction: {
                let i = this.bus.Read(ioTick, this.ip);
                if (i == null)
                    throw `no response @ ${this.ip}`;
                this.dword = i;
                this.state = CPUState.ProcessInstruction;

                break;
            }

            case CPUState.ReadWordFromRAM:
            case CPUState.ReadWordFromRAMStage2: {
                let i = this.bus.Read(ioTick, this.dataRq);
                if (i == null)
                    throw `no response @ ${this.dataRq}`;
                this.dword = i;

                break;
            }

            case CPUState.WriteWordToRAM: {
                this.bus.Write(ioTick, this.dataRq, this.register);

                break;
            }
        }
    }

    public getState(): ISimpleCPUState {
        return {
            state: CPUState[this.state],
            register: this.register,
            ip: this.ip
        };
    }

    public serialize(): { name: string; uuid: string; context: any } {
        return {name: SIMPLECPU_NAME, uuid: this.uuid, context: undefined};
    }
}

MasterBusMasterRegistry[SIMPLECPU_NAME] = (context, uuid: string = v4()) => {
    const cpu = new SimpleCPU();
    cpu.uuid = uuid;
    return cpu;
}