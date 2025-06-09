import { Device, MasterBusDeviceRegistry } from "src/backend/Emulator/Bus";
import { v4 } from "uuid";

const CONSOLELOG_NAME: string = "consolelog";

export class ConsoleLog extends Device<number, number> {
    // public svelteComponent: any | null = null;

    public static fromContext(context: any, uuid?: string): ConsoleLog {
        const cl = new ConsoleLog();
        cl.uuid = uuid ?? v4();
        return cl;
    }

    public static fromBuffer(state: SharedArrayBuffer, uuid: string): ConsoleLog {
        const cl = new ConsoleLog();
        cl.uuid = uuid;
        cl.state = state;
        return cl;
    }

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
    
    public get info(): { name: string; uuid: string; } {
        return { name: CONSOLELOG_NAME, uuid: this.uuid };
    }

    public serialize(): any {
    }

    public getState(): any {
        return undefined;
    }
}

MasterBusDeviceRegistry.set(CONSOLELOG_NAME, { fromContext: ConsoleLog.fromContext, fromBuffer: ConsoleLog.fromBuffer });