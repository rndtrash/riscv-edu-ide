import { useEffect, useState } from "preact/hooks";
import { useFileSystem } from "src/components/FileSystemContext";

type Entry = {
    name: string;
    isFile: boolean;
    handle: FileSystemHandle;
};

export function FileBrowser(props: {
    dirHandle: FileSystemDirectoryHandle,
    depth?: number
}) {
    const depth = props.depth ?? 0;

    const [entries, setEntries] = useState<Entry[]>([]);
    const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

    const refresh = async () => {
        const out: Entry[] = [];
        for await (const [name, handle] of props.dirHandle.entries()) {
            out.push({
                name,
                isFile: handle.kind === 'file',
                handle,
            });
        }
        out.sort((a, b) => {
            if (a.isFile !== b.isFile) {
                return a.isFile ? 1 : -1;
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
        setEntries(out);
    };

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, 2000);
        return () => clearInterval(id);
    }, [props.dirHandle]);

    const toggleDir = (name: string) => {
        setExpandedDirs(prev => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const createFile = async () => {
        const name = prompt('Введите имя файла:');
        if (!name) return;
        const handle = await props.dirHandle.getFileHandle(name, { create: true });
        const writable = await handle.createWritable();
        await writable.write('');
        await writable.close();
        await refresh();
    };

    const createDir = async () => {
        const name = prompt('Введите имя папки:');
        if (!name) return;
        await props.dirHandle.getDirectoryHandle(name, { create: true });
        await refresh();
    };

    return (
        <div style={{ fontFamily: 'sans-serif', paddingLeft: depth === 0 ? '1rem' : 0 }}>
            {depth === 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <button onClick={createFile}>Новый файл</button>
                    <button onClick={createDir} style={{ marginLeft: '0.5rem' }}>Новая папка</button>
                </div>
            )}
            <ul style={{ listStyle: 'none', paddingLeft: `${depth * 1.25}rem`, margin: 0 }}>
                {entries.map(ent => (
                    <li key={ent.name} style={{ padding: '0.25rem 0' }}>
                        {ent.isFile ? (
                            <span>📄 {ent.name}</span>
                        ) : (
                            <div>
                                <span style={{ cursor: 'pointer' }} onClick={() => toggleDir(ent.name)}>
                                    {expandedDirs[ent.name] ? '📂' : '📁'} {ent.name}
                                </span>
                                {expandedDirs[ent.name] && (
                                    <FileBrowser dirHandle={ent.handle as FileSystemDirectoryHandle} depth={depth + 1} />
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

}