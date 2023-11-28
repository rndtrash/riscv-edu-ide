import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";

export class ConsoleLog extends Device<number, number> {
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
}

MasterBusDeviceRegistry["consolelog"] = (context: any) => new ConsoleLog();