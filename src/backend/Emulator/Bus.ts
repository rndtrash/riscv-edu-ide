import type { IMachineSerializable, IMachineVisualizable } from "src/backend/Emulator/MachineSerializable";
import { v4 } from "uuid";

export abstract class TickReceiver implements IMachineSerializable, IMachineVisualizable {
    // public abstract svelteComponent: any | null;

    public lastTick: number = -1;
    public uuid: string = v4();
    public state: SharedArrayBuffer = null;

    protected constructor() { }

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

    public abstract get info(): { name: string; uuid: string; };

    public abstract serialize(): { name: string; uuid: string; context: any };
}

export interface IBusState<Address, Data> {
    address: Address | null;
    value: Data | null;
    isRead: boolean | null;
}

export class Bus<Address, Data> extends Device<Address, Data> {
    public svelteComponent: any | null = null;
    protected _devices: Device<Address, Data>[];
    protected _dataView: DataView;

    get isRead(): boolean | null {
        const byte = this._dataView.getInt8(5);
        if (byte === -1) return null;

        return byte === 1;
    }

    private static booleanToByte(value: boolean | null): number {
        if (value === null) return -1;

        if (value === true) return 1;

        return 0;
    }

    set isRead(value: boolean | null) {
        this._dataView.setInt8(5, Bus.booleanToByte(value));
    }

    get address(): Address | null {
        return this.isRead !== null ? this._dataView.getUint32(0) as Address : null;
    }

    set address(value: Address) {
        this._dataView.setUint32(0, value as number);
    }

    get value(): Data | null {
        return this.isRead !== null ? this._dataView.getUint32(4) as Data : null;
    }

    set value(value: Data) {
        this._dataView.setUint32(4, value as number);
    }

    public get devices() {
        return this._devices;
    }

    protected init(): void {
        this.isRead = null;
        this.uuid = v4();
    }

    public static fromContext<Address, Data>(devices: Device<Address, Data>[]): Bus<Address, Data> {
        const bus = new Bus<Address, Data>();
        bus._devices = devices;
        bus.state = new SharedArrayBuffer(4 + 4 + 1);
        bus._dataView = new DataView(bus.state);
        bus.init();
        return bus;
    }

    public static fromBuffer<Address, Data>(devices: Device<Address, Data>[], uuid: string, state: SharedArrayBuffer): Bus<Address, Data> {
        const bus = new Bus<Address, Data>();
        bus.uuid = uuid;
        bus._devices = devices;
        bus.state = state;
        bus._dataView = new DataView(state);
        return bus;
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

        this.address = address;
        this.value = response;
        this.isRead = true;
        return response;
    }

    public DeviceWrite(ioTick: number, address: Address, data: Data): void {
        for (const device of this._devices) {
            device.Write(ioTick, address, data);
        }

        this.address = address;
        this.value = data;
        this.isRead = false;
    }

    public DeviceTick(tick: number): void {
        for (const device of this._devices) {
            device.Tick(tick);
        }

        if (this.lastIO != tick) {
            // Then no operations were done on this tick
            this.isRead = null;
        }
    }

    public get info(): { name: string; uuid: string; } {
        return { name: "bus", uuid: this.uuid };
    }

    public serialize(): any {
        throw "Not implemented";

        //return {name: "bus", context: undefined};
    }

    public getState(): IBusState<Address, Data> {
        return { isRead: this.isRead, address: this.address, value: this.value };
    }
}

export abstract class Master<Address, Data> extends TickReceiver {
    public lastIO: number = -1;
    public bus: Bus<Address, Data>;

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

    public abstract get info(): { name: string; uuid: string; };

    public abstract serialize(): any;
}

export interface IMasterConstructor {
    fromContext: ((context: any, uuid?: string) => Master<number, number>);
    fromBuffer: ((state: SharedArrayBuffer, uuid: string) => Master<number, number>);
}

export interface IDeviceConstructor {
    fromContext: ((context: any, uuid?: string) => Device<number, number>);
    fromBuffer: ((state: SharedArrayBuffer, uuid: string) => Device<number, number>);
}

export const MasterBusDeviceRegistry = new Map<string, IDeviceConstructor>();
export const MasterBusMasterRegistry = new Map<string, IMasterConstructor>();