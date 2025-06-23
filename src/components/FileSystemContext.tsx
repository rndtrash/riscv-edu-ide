import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

type FileSystemContextType = {
    rootDir: FileSystemDirectoryHandle | null;
    refresh: () => Promise<void>;
};

const FileSystemContext = createContext<FileSystemContextType>({
    rootDir: null,
    refresh: async () => { },
});

export function FileSystemProvider({ children }: { children: ComponentChildren }) {
    const [rootDir, setRootDir] = useState<FileSystemDirectoryHandle | null>(null);

    const init = async () => {
        const dir = await navigator.storage.getDirectory();
        setRootDir(dir);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <FileSystemContext.Provider value={{ rootDir, refresh: init }}>
            {children}
        </FileSystemContext.Provider>
    );
}

export function useFileSystem() {
    return useContext(FileSystemContext);
}
