export interface IMachineSerializable {
    serialize(): { name: string, uuid: string, context: any };
}

export interface IMachineVisualizable {
    // svelteComponent: any | null;
    getState(): any;
}