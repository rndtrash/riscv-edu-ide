import {Device, Master, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";

export class ZeroToZero extends Master<number, number> {
    protected MasterTick(tick: number): void {
        console.log("z2z: tick");
    }

    protected MasterIO(ioTick: number): void {
        this.bus.Write(ioTick, 0, 0);
    }
}