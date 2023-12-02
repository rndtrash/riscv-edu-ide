import {Master, MasterBusMasterRegistry} from "$lib/backend/Emulator/Bus";
import type {ComponentType} from "svelte";

const ZERO2ZERO_NAME: string = "z2z";

export class ZeroToZero extends Master<number, number> {
    public svelteComponent: ComponentType | undefined = undefined;

    protected DeviceTick(tick: number): void {
        console.log("z2z: tick");
    }

    protected MasterIO(ioTick: number): void {
        this.bus.Write(ioTick, 0, 0);
    }

    public serialize(): { name: string; context: any } {
        return {name: ZERO2ZERO_NAME, context: undefined};
    }

    getState(): any {
    }
}

MasterBusMasterRegistry[ZERO2ZERO_NAME] = () => new ZeroToZero();