import { ComponentChildren, createContext } from "preact";
import { MutableRef, useContext, useRef } from "preact/hooks";

interface IEditorManager {
    saveFile: MutableRef<() => void>;
}

const EditorManagerContext = createContext<IEditorManager>({
    saveFile: null,
});

export function EditorManager({ children }: { children: ComponentChildren }) {
    const save = useRef<() => void>(null);

    return (
        <EditorManagerContext.Provider value={{ saveFile: save }}>
            {children}
        </EditorManagerContext.Provider>
    );
}

export function useEditorManager() {
    return useContext(EditorManagerContext);
}