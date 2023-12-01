import type {IMachineSerializable, IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";
import DeviceVisualBus from "$lib/device-visuals/DeviceVisualBus.svelte";
import type {ComponentType} from "svelte";

export abstract class TickReceiver implements IMachineSerializable, IMachineVisualizable {
    public abstract svelteComponent: ComponentType | undefined;

    public lastTick: number = -1;

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

    public abstract serialize(): { name: string; context: any };
}

export abstract class Device<Address, Data> extends TickReceiver {
    public lastIO: number = -1;
    protected _response: Data | undefined = undefined;

    public HasDoneIO(ioTick: number) {
        return this.lastIO == ioTick;
    }

    public Read(ioTick: number, address: Address): Data | undefined {
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

    protected abstract DeviceRead(ioTick: number, address: Address): Data | undefined;

    protected abstract DeviceWrite(ioTick: number, address: Address, data: Data): void;

    public abstract serialize(): { name: string; context: any };
}

export interface IBusState<Address, Data> {
    address: Address | undefined;
    value: Data | undefined;
    isRead: boolean | undefined;
}

export class Bus<Address, Data> extends Device<Address, Data> {
    public svelteComponent: ComponentType | undefined = DeviceVisualBus;
    protected _devices: Device<Address, Data>[];
    private _lastOperation: IBusState<Address, Data> = {
        address: undefined,
        value: undefined,
        isRead: undefined
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

    public DeviceRead(ioTick: number, address: Address): Data | undefined {
        let response: Data | undefined = undefined;
        let responseDevice: Device<Address, Data> | undefined = undefined;
        for (const device of this._devices) {
            let deviceResponse = device.Read(ioTick, address);
            if (response === undefined) {
                response = deviceResponse;
                responseDevice = device;
            } else if (deviceResponse !== undefined) {
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
            this._lastOperation = {address: undefined, value: undefined, isRead: undefined};
        }
    }

    public serialize(): { name: string; context: any } {
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

    public abstract serialize(): { name: string; context: any };
}

export const MasterBusDeviceRegistry: { [name: string]: ((context: any) => Device<number, number>) } = {};
export const MasterBusMasterRegistry: { [name: string]: ((context: any) => Master<number, number>) } = {};