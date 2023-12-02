import type {FSFile} from "$lib/backend/FileSystem";
import * as Monaco from "monaco-editor";

export function makeState(file?: FSFile, language?: string): Monaco.editor.ITextModel {
    return Monaco.editor.createModel(
        file?.text ?? "",
        language
    );
}