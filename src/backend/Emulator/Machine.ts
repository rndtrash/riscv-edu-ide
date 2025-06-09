import { Bus, Device, Master, MasterBusDeviceRegistry, MasterBusMasterRegistry } from "src/backend/Emulator/Bus";
import "src/backend/Emulator/Devices/All";
import "src/backend/Emulator/Masters/All";

export interface ISystemConfiguration {
    master: { name: string; context: any },
    devices: { name: string; context: any }[]
}

export interface IDeviceWorkerExchange {
    info: { name: string; uuid: string; };
    state: SharedArrayBuffer;
}

export interface ISystemWorkerExchange {
    master: IDeviceWorkerExchange;
    bus: {
        exchange: IDeviceWorkerExchange;
        devices: IDeviceWorkerExchange[];
    };
}

export interface IMachineWorkerMessage {
    type: "load" | "tick";
}

export interface IMachineWorkerMessageLoad extends IMachineWorkerMessage {
    type: "load";
    machine: ISystemWorkerExchange;
}

export interface IMachineWorkerMessageTick extends IMachineWorkerMessage {
    type: "tick";
}

export class Machine {
    _masterBus: Bus<number, number>;
    _master: Master<number, number>;
    _tick: number = 0;

    protected constructor() { }

    public static FromMasterDevices(master: Master<number, number>, devices: Device<number, number>[]): Machine {
        const machine = new Machine();

        // let deviceInstances: Device<number, number>[] = [];
        // for (let device of devices) {
        //     deviceInstances.push(device);
        // }
        machine._masterBus = Bus.fromContext<number, number>(devices);

        machine._master = master;
        machine._master.bus = machine._masterBus;

        return machine;
    }

    public static FromSystemConfiguration(systemConfiguration: ISystemConfiguration): Machine {
        let master: Master<number, number> = MasterBusMasterRegistry.get(systemConfiguration.master.name).fromContext(systemConfiguration.master.context);

        let devices: Device<number, number>[] = Array.of<Device<number, number>>();
        for (let deviceSerialized of systemConfiguration.devices) {
            let device = MasterBusDeviceRegistry[deviceSerialized.name](deviceSerialized.context);
            devices = [...devices, device];
        }

        return Machine.FromMasterDevices(master, devices);
    }

    public static FromWorkerExchange(workerExchange: ISystemWorkerExchange): Machine {
        let master: Master<number, number> = MasterBusMasterRegistry
            .get(workerExchange.master.info.name)
            .fromBuffer(workerExchange.master.state, workerExchange.master.info.uuid);

        let devices: Device<number, number>[] = Array.of<Device<number, number>>();
        for (let deviceSerialized of workerExchange.bus.devices) {
            let device = MasterBusDeviceRegistry.get(deviceSerialized.info.name).fromBuffer(deviceSerialized.state, deviceSerialized.info.uuid);
            devices = [...devices, device];
        }

        const machine = new Machine();

        machine._masterBus = Bus.fromBuffer<number, number>(devices, workerExchange.bus.exchange.info.uuid, workerExchange.bus.exchange.state);

        machine._master = master;
        machine._master.bus = machine._masterBus;

        return machine;
    }

    public toSystemConfiguration(): ISystemConfiguration {
        return { master: this._master.serialize(), devices: this._masterBus.devices.map((device) => device.serialize()) };
    }

    public toWorkerExchange(): ISystemWorkerExchange {
        return {
            master: { info: this._master.info, state: this._master.state },
            bus: {
                exchange: { info: this._masterBus.info, state: this._masterBus.state },
                devices: this._masterBus.devices.map((device) => { return { info: device.info, state: device.state } })
            }
        };
    }

    public get masterBus() {
        return this._masterBus;
    }

    public get tick() {
        return this._tick;
    }

    public doTick(): void {
        this._master.DoIO(this.tick);
        this._master.Tick(this.tick);
        this._masterBus.Tick(this.tick);
        this._tick++;
    }

    public shareWith(worker: Worker): void {
        const message: IMachineWorkerMessageLoad = { type: "load", machine: this.toWorkerExchange() };
        worker.postMessage(message);
    }
}