import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";

const RAM32_NAME: string = "ram32";

export class RAM32 extends Device<number, number> {
    protected position: number;
    protected array: Uint32Array;

    constructor(position: number, size: number) {
        super();

        this.position = position ?? 0;
        this.array = new Uint32Array(size);
    }

    protected DeviceRead(ioTick: number, address: number): number | undefined {
        if (address < this.position || address >= this.position + this.array.length * 4)
            return undefined;

        let value = this.array[(address - this.position) >> 2];
        console.log(`ram read @ ${address.toString(16)} = ${value}`);
        return value;
    }

    protected DeviceTick(tick: number): void {
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        if (address < this.position || address >= this.position + this.array.length * 4)
            return undefined;

        console.log(`ram write @ ${address.toString(16)} = ${data.toString(16)}`);
        this.array[((address - this.position) >> 4) << 4] = data;
    }

    public serialize(): { name: string; context: any } {
        return {
            name: RAM32_NAME, context: {
                address: this.position,
                size: this.array.length
            }
        };
    }
}

MasterBusDeviceRegistry[RAM32_NAME] = (context: {
    address: number,
    size: number
}) => new RAM32(context.address, context.size);
