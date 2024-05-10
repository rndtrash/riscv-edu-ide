import type {IMachineSerializable, IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";
import DeviceVisualBus from "$lib/device-visuals/DeviceVisualBus.svelte";
import type {ComponentType} from "svelte";
import {v4} from "uuid";

export abstract class TickReceiver implements IMachineSerializable, IMachineVisualizable {
    public abstract svelteComponent: ComponentType | null;

    public lastTick: number = -1;
    public uuid: string = v4();

    public HasTicked(tick: number) {
        return this.lastTick == tick;
    }

    public Tick(tick: number): void {
        if (!this.HasTicked(tick)) {
            this.DeviceTick(tick);
            this.lastTick = tick;
        }
    }

    protected abstract DeviceTick(tick: number): void;

    // TODO: reset

    public abstract getState(): any;

    public abstract serialize(): { name: string; uuid: string; context: any };
}

export abstract class Device<Address, Data> extends TickReceiver {
    public lastIO: number = -1;
    protected _response: Data | null = null;

    public HasDoneIO(ioTick: number) {
        return this.lastIO == ioTick;
    }

    public Read(ioTick: number, address: Address): Data | null {
        if (!this.HasDoneIO(ioTick)) {
            this._response = this.DeviceRead(ioTick, address);
            this.lastIO = ioTick;
        }

        return this._response;
    }

    public Write(ioTick: number, address: Address, data: Data): void {
        if (!this.HasDoneIO(ioTick)) {
            this.DeviceWrite(ioTick, address, data);
            this.lastIO = ioTick;
        }
    }

    protected abstract DeviceRead(ioTick: number, address: Address): Data | null;

    protected abstract DeviceWrite(ioTick: number, address: Address, data: Data): void;

    public abstract serialize(): { name: string; uuid: string; context: any };
}

export interface IBusState<Address, Data> {
    address: Address | null;
    value: Data | null;
    isRead: boolean | null;
}

export class Bus<Address, Data> extends Device<Address, Data> {
    public svelteComponent: ComponentType | null = DeviceVisualBus;
    protected _devices: Device<Address, Data>[];
    private _lastOperation: IBusState<Address, Data> = {
        address: null,
        value: null,
        isRead: null
    };

    constructor(devices: Device<Address, Data>[]) {
        super();

        this._devices = devices;
    }

    public get devices() {
        return this._devices;
    }

    public AddDevice(device: Device<Address, Data>): void {
        this._devices = [...this._devices, device];
    }

    public DeviceRead(ioTick: number, address: Address): Data | null {
        let response: Data | null = null;
        let responseDevice: Device<Address, Data> | null = null;
        for (const device of this._devices) {
            let deviceResponse = device.Read(ioTick, address);
            if (response == null) {
                response = deviceResponse;
                responseDevice = device;
            } else if (deviceResponse != null) {
                // Only one device should write back to the bus
                throw `Bus collision with device ${device} (${deviceResponse}) and ${responseDevice} (${response})!`;
            }
        }

        this._lastOperation = {address: address, value: response, isRead: true};
        return response;
    }

    public DeviceWrite(ioTick: number, address: Address, data: Data): void {
        for (const device of this._devices) {
            device.Write(ioTick, address, data);
        }

        this._lastOperation = {address: address, value: data, isRead: true};
    }

    public DeviceTick(tick: number): void {
        for (const device of this._devices) {
            device.Tick(tick);
        }

        if (this.lastIO != tick) {
            // Then no operations were done on this tick
            this._lastOperation = {address: null, value: null, isRead: null};
        }
    }

    public serialize(): { name: string; uuid: string; context: any } {
        throw "Not implemented";

        //return {name: "bus", context: undefined};
    }

    public getState(): any {
        return this._lastOperation;
    }
}

export abstract class Master<Address, Data> extends TickReceiver {
    public lastIO: number = -1;
    public bus: Bus<Address, Data> = new Bus<Address, Data>([]);

    public HasDoneIO(ioTick: number) {
        return this.lastIO == ioTick;
    }

    public DoIO(ioTick: number): void {
        if (!this.HasDoneIO(ioTick)) {
            this.MasterIO(ioTick);
            this.lastIO = ioTick;
        }
    }

    protected abstract MasterIO(ioTick: number): void;

    public abstract serialize(): { name: string; uuid: string; context: any };
}

export const MasterBusDeviceRegistry: { [name: string]: ((context: any, uuid?: string) => Device<number, number>) } = {};
export const MasterBusMasterRegistry: { [name: string]: ((context: any, uuid?: string) => Master<number, number>) } = {};