import type {ComponentType, SvelteComponent} from 'svelte';
import type {Writable} from "svelte/store";

export type EditorTabConstraint = SvelteComponent<{ hasChanges: boolean, filePath: string, state: any | undefined }>;

export interface EditorTabPair {
    type: ComponentType<EditorTabConstraint>,
    icon: string,
    hasChanges: boolean,
    filePath: string,
    state: any | undefined
}