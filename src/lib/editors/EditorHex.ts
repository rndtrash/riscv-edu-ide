import type {EditorTabFunctions} from "$lib/editors/EditorTab";
import type {FSFile} from "$lib/backend/FileSystem";

export interface EditorHexState extends EditorTabFunctions {
    data: Uint8Array;
}

export function makeHexState(file: FSFile | undefined): EditorHexState {
    return {
        data: file?.contents ?? new Uint8Array(),
        save() {
            if (file !== undefined)
                file.contents = this.data;
        },
        close() {
        }
    };
}