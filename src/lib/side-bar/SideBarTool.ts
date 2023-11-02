import type {ComponentType, SvelteComponent} from 'svelte';
import type {Writable} from "svelte/store";

export type SideBarToolConstraint = SvelteComponent<any, { state: any, name: string, icon: string }>;

export interface SideBarToolPair {
    type: ComponentType<SideBarToolConstraint>,
    name: string,
    icon: string,
    state: Writable<any>
}