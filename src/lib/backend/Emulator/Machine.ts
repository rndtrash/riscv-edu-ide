import {Bus, Device, Master, MasterBusDeviceRegistry} from "$lib/backend/Emulator/Bus";
import "$lib/backend/Emulator/Devices/All";

export class Machine {
    _masterBus: Bus<number, number>;
    _master: Master<number, number>;
    _tick: number = 0;

    constructor(master: Master<number, number>, devices: { name: string, context: any }[]) {
        let deviceInstances: Device<number, number>[] = [];
        for (let device of devices) {
            deviceInstances.push(MasterBusDeviceRegistry[device.name](device.context));
        }
        this._masterBus = new Bus<number, number>(deviceInstances);

        this._master = master;
        this._master.bus = this._masterBus;
    }

    public get masterBus() {
        return this._masterBus;
    }

    public get tick() {
        return this._tick;
    }

    public Tick(): void {
        this._master.DoIO(this.tick);
        this._master.Tick(this.tick);
        this._masterBus.Tick(this.tick);
        this._tick++;
    }
}