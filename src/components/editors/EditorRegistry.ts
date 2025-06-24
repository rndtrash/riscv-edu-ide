import { FunctionComponent } from "preact";
import { EditorMonaco } from "./EditorMonaco";

export const Editors = new Map<string, FunctionComponent<any>>([
    ["code", EditorMonaco]
]);