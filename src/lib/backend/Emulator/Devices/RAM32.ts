import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";
import DeviceVisualRAM32 from "$lib/device-visuals/DeviceVisualRAM32.svelte";
import {v4} from "uuid";

const RAM32_NAME: string = "ram32";

export class RAM32 extends Device<number, number> {
    public svelteComponent: ComponentType | null = DeviceVisualRAM32;

    protected position: number;
    protected array: Uint32Array;

    constructor(position: number, size: number) {
        super();

        this.position = position ?? 0;
        this.array = new Uint32Array((size + 3) >> 2); // Integer division by 2
    }

    protected DeviceRead(ioTick: number, address: number): number | null {
        if (address < this.position || address >= this.position + this.array.length * 4)
            return null;

        if (address % 4 != 0)
            console.error(`ram unaligned access`);

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
        if (address % 4 == 0)
            this.array[((address - this.position) >> 2) << 2] = data;
        else
            console.error(`ram unaligned access`);
    }

    public serialize(): { name: string; uuid: string; context: any } {
        return {
            name: RAM32_NAME,
            uuid: this.uuid,
            context: {
                address: this.position,
                size: this.array.length * 4 // Size of the data
            }
        };
    }

    public getState(): Uint32Array {
        return new Uint32Array(this.array);
    }
}

MasterBusDeviceRegistry[RAM32_NAME] = (context: {
    address: number,
    size: number
}, uuid: string = v4()) => {
    const device = new RAM32(context.address, context.size);
    device.uuid = uuid;
    return device;
}
