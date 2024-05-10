import {Master, MasterBusMasterRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";
import {v4} from "uuid";

const ZERO2ZERO_NAME: string = "z2z";

export class ZeroToZero extends Master<number, number> {
    public svelteComponent: ComponentType | null = null;

    protected DeviceTick(tick: number): void {
        console.log("z2z: tick");
    }

    protected MasterIO(ioTick: number): void {
        this.bus.Write(ioTick, 0, 0);
    }

    public serialize(): { name: string; uuid: string; context: any } {
        return {name: ZERO2ZERO_NAME, uuid: this.uuid, context: undefined};
    }

    getState(): any {
    }
}

MasterBusMasterRegistry[ZERO2ZERO_NAME] = (context, uuid: string = v4()) => {
    const cpu = new ZeroToZero();
    cpu.uuid = uuid;
    return cpu;
}