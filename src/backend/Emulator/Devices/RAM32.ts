import { Device, MasterBusDeviceRegistry } from "src/backend/Emulator/Bus";
import { v4 } from "uuid";

const RAM32_NAME: string = "ram32";

export interface IRAM32Context {
    address: number;
    size: number;
}

export class RAM32 extends Device<number, number> {
    protected _dataView: DataView;
    // protected array: Uint32Array;

    protected get position(): number {
        return this._dataView.getUint32(0);
    }

    protected set position(v: number) {
        this._dataView.setUint32(0, v);
    }

    protected get size(): number {
        return this._dataView.getUint32(4);
    }

    protected set size(v: number) {
        this._dataView.setUint32(4, v);
    }

    protected getDword(address: number): number {
        return this._dataView.getUint32(4 + 4 + address);
    }

    protected setDword(address: number, value: number) {
        this._dataView.setUint32(4 + 4 + address, value);
    }

    public static fromContext<Address, Data>(context: IRAM32Context, uuid?: string): RAM32 {
        const ram = new RAM32();
        const calcSize = (context.size + 3) >> 2;

        ram.uuid = uuid ?? v4();
        ram.state = new SharedArrayBuffer(4 + 4 + calcSize);
        ram._dataView = new DataView(ram.state);
        ram.position = context.address;
        ram.size = calcSize;

        return ram;
    }

    public static fromBuffer(state: SharedArrayBuffer, uuid: string): RAM32 {
        const ram = new RAM32();

        ram.uuid = uuid;
        ram.state = state;
        ram._dataView = new DataView(ram.state);

        return ram;
    }

    protected DeviceRead(ioTick: number, address: number): number | null {
        if (address < this.position || address >= this.position + this.size)
            return null;

        if (address % 4 != 0)
            console.error(`ram unaligned access`);

        let value = this.getDword(address - this.position);
        console.log(`ram read @ ${address.toString(16)} = ${value}`);
        return value;
    }

    protected DeviceTick(tick: number): void {
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        if (address < this.position || address >= this.position + this.size)
            return undefined;

        console.log(`ram write @ ${address.toString(16)} = ${data.toString(16)}`);
        if (address % 4 == 0)
            this.setDword(((address - this.position) >> 2) << 2, data);
        else
            console.error(`ram unaligned access`);
    }

    public get info(): { name: string; uuid: string; } {
        return { name: RAM32_NAME, uuid: this.uuid };
    }

    public serialize(): any {
        return {
            address: this.position,
            size: this.size
        };
    }

    public getState(): Uint32Array {
        return new Uint32Array(this.state.slice(4 + 4));
    }
}

// TODO:
MasterBusDeviceRegistry.set(RAM32_NAME, {
    fromContext(context, uuid: string = v4()) {
        return RAM32.fromContext(context, uuid);
    },
    fromBuffer(state, uuid) {
        return RAM32.fromBuffer(state, uuid);
    },
});
