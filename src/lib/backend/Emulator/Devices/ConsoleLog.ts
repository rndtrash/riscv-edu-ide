import {Device, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";

export class ConsoleLog extends Device<number, number> {
    protected DeviceRead(ioTick: number, address: number): number | undefined {
        console.log(`READ: ${address}`);
        return undefined;
    }

    protected DeviceTick(tick: number): void {
        console.log("TICK");
    }

    protected DeviceWrite(ioTick: number, address: number, data: number): void {
        console.log(`WRITE: ${address} = ${data}`);
    }
}

MasterBusDeviceRegistry["consolelog"] = (context: any) => new ConsoleLog();