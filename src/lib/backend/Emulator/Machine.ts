import {Bus, Device, Master, MasterBusDeviceRegistry, MasterBusMasterRegistry} from "$lib/backend/Emulator/Bus";
import "$lib/backend/Emulator/Devices/All";
import "$lib/backend/Emulator/Masters/All";

export interface ISystemConfiguration {
    master: { name: string; context: any },
    devices: { name: string; context: any }[]
}

export class Machine {
    _masterBus: Bus<number, number>;
    _master: Master<number, number>;
    _tick: number = 0;

    constructor(master: Master<number, number>, devices: Device<number, number>[]) {
        let deviceInstances: Device<number, number>[] = [];
        for (let device of devices) {
            deviceInstances.push(device);
        }
        this._masterBus = new Bus<number, number>(deviceInstances);

        this._master = master;
        this._master.bus = this._masterBus;
    }

    public static FromSystemConfiguration(systemConfiguration: ISystemConfiguration): Machine {
        let master: Master<number, number> = MasterBusMasterRegistry[systemConfiguration.master.name](systemConfiguration.master.context);

        let devices: Device<number, number>[] = Array.of<Device<number, number>>();
        for (let deviceSerialized of systemConfiguration.devices) {
            let device = MasterBusDeviceRegistry[deviceSerialized.name](deviceSerialized.context);
            devices = [...devices, device];
        }

        return new Machine(master, devices);
    }

    public ToSystemConfiguration(): ISystemConfiguration {
        return {master: this._master.serialize(), devices: this._masterBus.devices.map((device) => device.serialize())};
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