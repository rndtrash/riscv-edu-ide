import { ComponentChildren, createContext } from "preact";
import { useContext, useState } from "preact/hooks";

interface IEditorManager {
    openFile: (path: string) => void;
    currentFile: string;
}

const EditorManagerContext = createContext<IEditorManager>({
    openFile: null,
    currentFile: ""
});

export function EditorManager({ children }: { children: ComponentChildren }) {
    const [file, setFile] = useState<string>("");

    return (
        <EditorManagerContext.Provider value={{ openFile: setFile, currentFile: file }}>
            {children}
        </EditorManagerContext.Provider>
    );
}

export function useEditorManager() {
    return useContext(EditorManagerContext);
}