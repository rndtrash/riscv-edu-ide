import { Master, MasterBusMasterRegistry } from "src/backend/Emulator/Bus";
import { v4 } from "uuid";

const ZERO2ZERO_NAME: string = "z2z";

export class ZeroToZero extends Master<number, number> {
    // public svelteComponent: any | null = null;

    public static fromContext(context: any, uuid?: string): ZeroToZero {
        const z2z = new ZeroToZero();
        z2z.uuid = uuid ?? v4();
        return z2z;
    }

    public static fromBuffer(state: SharedArrayBuffer, uuid: string): ZeroToZero {
        const z2z = new ZeroToZero();
        z2z.uuid = uuid;
        z2z.state = state;
        return z2z;
    }

    protected DeviceTick(tick: number): void {
        console.log("z2z: tick");
    }

    protected MasterIO(ioTick: number): void {
        this.bus.Write(ioTick, 0, 0);
    }

    public get info(): { name: string; uuid: string; } {
        return { name: ZERO2ZERO_NAME, uuid: this.uuid };
    }

    public serialize(): any {
        return { name: ZERO2ZERO_NAME, uuid: this.uuid, context: undefined };
    }

    getState(): any {
    }
}

MasterBusMasterRegistry.set(ZERO2ZERO_NAME, { fromContext: (ctx, uuid) => ZeroToZero.fromContext(ctx, uuid), fromBuffer: ZeroToZero.fromBuffer });