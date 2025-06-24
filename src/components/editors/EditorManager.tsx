import { ComponentChildren, createContext } from "preact";
import { Dispatch, StateUpdater, useContext, useState } from "preact/hooks";

interface IEditorManager {
    saveFile: () => void;
    setSaveCallback: Dispatch<StateUpdater<() => void>>;
}

const EditorManagerContext = createContext<IEditorManager>({
    saveFile: null,
    setSaveCallback: null
});

export function EditorManager({ children }: { children: ComponentChildren }) {
    const [save, setSave] = useState<() => void>(null);

    return (
        <EditorManagerContext.Provider value={{ saveFile: save, setSaveCallback: setSave }}>
            {children}
        </EditorManagerContext.Provider>
    );
}

export function useEditorManager() {
    return useContext(EditorManagerContext);
}