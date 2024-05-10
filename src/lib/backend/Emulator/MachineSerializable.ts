import type {ComponentType} from "svelte";

export interface IMachineSerializable {
    serialize(): { name: string, uuid: string, context: any };
}

export interface IMachineVisualizable {
    svelteComponent: ComponentType | null;
    getState(): any;
}