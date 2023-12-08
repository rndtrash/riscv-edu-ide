import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";

const CONSOLELOG_NAME: string = "consolelog";

export class ConsoleLog extends Device<number, number> {
    public svelteComponent: ComponentType | undefined = undefined;

    protected DeviceRead(ioTick: number, address: number): number | undefined {
        console.log(`READ: ${address.toString(16)}`);
        return undefined;
    }

    protected DeviceTick(tick: number): void {
        console.log("TICK");
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        console.log(`WRITE: ${address.toString(16)} = ${data.toString(16)}`);
    }

    public serialize(): { name: string; context: any } {
        return {name: CONSOLELOG_NAME, context: undefined};
    }

    public getState(): any {
        return undefined;
    }
}

MasterBusDeviceRegistry[CONSOLELOG_NAME] = () => new ConsoleLog();