import type {Action} from "svelte/action";

export abstract class Device<Address, Data> {
    public lastTick: number = -1;
    public lastIO: number = -1;
    protected _response: Data | undefined = undefined;

    public HasTicked(tick: number) {
        return this.lastTick == tick;
    }

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

    public Tick(tick: number): void {
        if (!this.HasTicked(tick)) {
            this.DeviceTick(tick);
            this.lastTick = tick;
        }
    }

    protected abstract DeviceRead(ioTick: number, address: Address): Data | undefined;

    protected abstract DeviceWrite(ioTick: number, address: Address, data: Data): void;

    protected abstract DeviceTick(tick: number): void;
}

export class Bus<Address, Data> extends Device<Address, Data> {
    protected _devices: Device<Address, Data>[];

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

        return response;
    }

    public DeviceWrite(ioTick: number, address: Address, data: Data): void {
        for (const device of this._devices) {
            device.Write(ioTick, address, data);
        }
    }

    public DeviceTick(tick: number): void {
        for (const device of this._devices) {
            device.Tick(tick);
        }
    }

}

export abstract class Master<Address, Data> {
    public lastTick: number = -1;
    public lastIO: number = -1;
    public bus: Bus<Address, Data> = new Bus<Address, Data>([]);

    public HasTicked(tick: number) {
        return this.lastTick == tick;
    }

    public HasDoneIO(ioTick: number) {
        return this.lastIO == ioTick;
    }

    public Tick(tick: number): void {
        if (!this.HasTicked(tick)) {
            this.MasterTick(tick);
            this.lastTick = tick;
        }
    }

    protected abstract MasterTick(tick: number): void;

    public DoIO(ioTick: number): void {
        if (!this.HasDoneIO(ioTick)) {
            this.MasterIO(ioTick);
            this.lastIO = ioTick;
        }
    }

    protected abstract MasterIO(ioTick: number): void;
}

export const MasterBusDeviceRegistry: { [name: string]: ((context: any) => Device<number, number>) } = {};