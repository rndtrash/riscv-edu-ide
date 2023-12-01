import type {ComponentType} from "svelte";

export interface IMachineSerializable {
    serialize(): { name: string, context: any };
}

export interface IMachineVisualizable {
    svelteComponent: ComponentType | undefined;
    getState(): any;
}