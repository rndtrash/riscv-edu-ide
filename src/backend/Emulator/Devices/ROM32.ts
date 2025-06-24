import { Device, MasterBusDeviceRegistry } from "src/backend/Emulator/Bus";
import { v4 } from "uuid";

const ROM32_NAME: string = "rom32";

export interface IROM32Context {
    address: number;
    contents: Iterable<number>;
    readOnly: boolean;
}

export class ROM32 extends Device<number, number> {
    protected _dataView: DataView;

    public get position(): number {
        return this._dataView.getUint32(0);
    }

    protected set position(v: number) {
        this._dataView.setUint32(0, v);
    }

    public get size(): number {
        return this._dataView.getUint32(4);
    }

    protected set size(v: number) {
        this._dataView.setUint32(4, v);
    }

    protected get readOnly(): boolean {
        return this._dataView.getUint32(4 + 4) !== 0;
    }

    protected set readOnly(v: boolean) {
        this._dataView.setUint32(4 + 4, v ? 1 : 0);
    }

    public getDword(address: number): number {
        return this._dataView.getUint32(4 + 4 + 4 + address);
    }

    public setDword(address: number, value: number) {
        this._dataView.setUint32(4 + 4 + 4 + address, value);
    }

    public static fromContext<Address, Data>(context: IROM32Context, uuid?: string): ROM32 {
        const rom = new ROM32();

        const arr = new Uint32Array(context.contents);

        rom.uuid = uuid ?? v4();
        rom.state = new SharedArrayBuffer(4 + 4 + 4 + arr.byteLength);
        rom._dataView = new DataView(rom.state);
        rom.position = context.address;
        rom.readOnly = context.readOnly ?? true;
        rom.size = arr.byteLength;

        for (let i = 0; i < arr.length; i++) {
            rom._dataView.setUint32(4 + 4 + 4 + i * 4, arr[i]);
        }

        return rom;
    }

    public static fromBuffer(state: SharedArrayBuffer, uuid: string): ROM32 {
        const rom = new ROM32();

        rom.uuid = uuid;
        rom.state = state;
        rom._dataView = new DataView(rom.state);

        return rom;
    }

    // constructor(position: number, contents: Uint32Array, readOnly: boolean) {
    //     super();

    //     this.position = position ?? 0;
    //     if (contents === undefined)
    //         throw "Why would you make a ROM with no contents?";
    //     this.contents = contents;
    //     this.readOnly = readOnly ?? true;
    // }

    protected DeviceRead(ioTick: number, address: number): number | null {
        if (address < this.position || address >= this.position + this.size)
            return null;

        if (address % 4 != 0)
            console.error(`rom unaligned access`);

        let value = this.getDword(address - this.position);
        console.log(`rom read @ ${address.toString(16)} = ${value}`);
        return value;
    }

    protected DeviceTick(tick: number): void {
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        if (this.readOnly || address < this.position || address >= this.position + this.size)
            return undefined;

        console.log(`rom write @ ${address.toString(16)} = ${data.toString(16)}`);
        if (address % 4 == 0)
            this.setDword(((address - this.position) >> 2) << 2, data);
        else
            console.error(`rom unaligned access`);
    }

    public get info(): { name: string; uuid: string; } {
        return { name: ROM32_NAME, uuid: this.uuid };
    }

    public serialize(): { name: string; uuid: string; context: IROM32Context } {
        return {
            name: ROM32_NAME,
            uuid: this.uuid,
            context: {
                address: this.position,
                contents: Array.from(new Uint32Array(this.state.slice(4 + 4 + 4))),
                readOnly: this.readOnly
            }
        };
    }

    public getState(): Uint32Array {
        return new Uint32Array(this.state.slice(4 + 4 + 4));
    }
}

MasterBusDeviceRegistry.set(ROM32_NAME, {
    fromContext(context: IROM32Context, uuid: string = v4()) {
        return ROM32.fromContext(context, uuid);
    },
    fromBuffer(state, uuid) {
        return ROM32.fromBuffer(state, uuid);
    },
});
