import type {ComponentType, SvelteComponent} from 'svelte';
import type {Writable} from "svelte/store";

export type SideBarToolConstraint = SvelteComponent<{ state: any | undefined, iconStatus: Writable<ButtonStatusIcon> }>;

export enum ButtonStatusIcon {
    None,
    Warning,
    Error,
    Info
}

export interface SideBarToolPair {
    type: ComponentType<SideBarToolConstraint>,
    name: string,
    icon: string,
    iconStatus: Writable<ButtonStatusIcon>,
    state: any | null
}