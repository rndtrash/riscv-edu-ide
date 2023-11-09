import type {ComponentType, SvelteComponent} from 'svelte';

export type SideBarToolConstraint = SvelteComponent<{ state: any | undefined }>;

export interface SideBarToolPair {
    type: ComponentType<SideBarToolConstraint>,
    name: string,
    icon: string,
    state: any | undefined
}