import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";

export class ROM32 extends Device<number, number> {
    protected position: number;
    protected contents: Uint32Array;
    protected readOnly: boolean;

    constructor(position: number, contents: Uint32Array, readOnly: boolean) {
        super();

        this.position = position ?? 0;
        if (contents === undefined)
            throw "Why would you make a ROM with no contents?";
        this.contents = contents;
        this.readOnly = readOnly ?? true;
    }

    protected DeviceRead(ioTick: number, address: number): number | undefined {
        if (address < this.position || address >= this.position + this.contents.length * 4)
            return undefined;

        let value = this.contents[(address - this.position) >> 2];
        console.log(`rom read @ ${address.toString(16)} = ${value}`);
        return value;
    }

    protected DeviceTick(tick: number): void {
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        if (this.readOnly || address < this.position || address >= this.position + this.contents.length * 4)
            return undefined;

        console.log(`rom write @ ${address.toString(16)} = ${data.toString(16)}`);
        this.contents[((address - this.position) >> 4) << 4] = data;
    }
}

MasterBusDeviceRegistry["rom32"] = (context: {
    address: number,
    contents: Uint32Array,
    readOnly: boolean
}) => new ROM32(context.address, context.contents, context.readOnly);
