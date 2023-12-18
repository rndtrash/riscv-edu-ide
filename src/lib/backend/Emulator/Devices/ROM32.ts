import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";
import DeviceVisualROM32 from "$lib/device-visuals/DeviceVisualROM32.svelte";

const ROM32_NAME: string = "rom32";

export class ROM32 extends Device<number, number> {
    public svelteComponent: ComponentType | undefined = DeviceVisualROM32;

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

        if (address % 4 != 0)
            console.error(`rom unaligned access`);

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
        if (address % 4 == 0)
            this.contents[((address - this.position) >> 2) << 2] = data;
        else
            console.error(`rom unaligned access`);
    }

    public serialize(): { name: string; context: any } {
        return {
            name: ROM32_NAME, context: {
                address: this.position,
                contents: Array.from<number>(this.contents),
                readOnly: this.readOnly
            }
        };
    }

    public getState(): Uint32Array {
        return new Uint32Array(this.contents);
    }
}

MasterBusDeviceRegistry[ROM32_NAME] = (context: {
    address: number,
    contents: Iterable<number>,
    readOnly: boolean
}) => new ROM32(context.address, new Uint32Array(context.contents), context.readOnly);
