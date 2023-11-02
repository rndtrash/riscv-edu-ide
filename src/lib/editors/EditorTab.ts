import type {ComponentType, SvelteComponent} from 'svelte';
import type {Writable} from "svelte/store";

export type EditorTabConstraint = SvelteComponent<any, { state: Writable<any>, title: string, icon: string }>;

export interface EditorTabPair {
    type: ComponentType<EditorTabConstraint>,
    title: string | undefined,
    icon: string,
    state: Writable<any>
}