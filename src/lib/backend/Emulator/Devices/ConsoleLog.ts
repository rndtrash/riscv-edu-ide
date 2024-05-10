import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";
import {v4} from "uuid";

const CONSOLELOG_NAME: string = "consolelog";

export class ConsoleLog extends Device<number, number> {
    public svelteComponent: ComponentType | null = null;

    protected DeviceRead(ioTick: number, address: number): number | null {
        console.log(`READ: ${address.toString(16)}`);
        return null;
    }

    protected DeviceTick(tick: number): void {
        console.log("TICK");
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        console.log(`WRITE: ${address.toString(16)} = ${data.toString(16)}`);
    }

    public serialize(): { name: string; uuid: string; context: any } {
        return {name: CONSOLELOG_NAME, uuid: this.uuid, context: undefined};
    }

    public getState(): any {
        return undefined;
    }
}

MasterBusDeviceRegistry[CONSOLELOG_NAME] = (context, uuid: string = v4()) => {
    const device = new ConsoleLog();
    device.uuid = uuid;
    return device;
}