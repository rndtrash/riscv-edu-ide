import type {FSFile} from "$lib/backend/FileSystem";
import Monaco from "./monaco";
import type {EditorTabFunctions} from "$lib/editors/EditorTab";

export interface EditorMonacoState extends EditorTabFunctions {
    model: Monaco.editor.ITextModel;
    file: FSFile | undefined;
}

export function makeMonacoState(file?: FSFile, language?: string): EditorMonacoState {
    const model = Monaco.editor.createModel(
        file?.text ?? "",
        language
    );

    return {
        model: model,
        file: file,

        save() {
        },

        close() {
            this.model.dispose();
        }
    };
}