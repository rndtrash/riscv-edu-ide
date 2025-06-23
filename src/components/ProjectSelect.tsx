import projectIcon from "src/assets/project.svg";
import style from "./ProjectSelect.module.css";
import { useProject } from "./ProjectContext";
import { useFileSystem } from "./FileSystemContext";
import { useEffect, useState } from "preact/hooks";
import JSZip from "jszip";
import { combinePath, PATH_SEPARATOR } from "src/backend/FileSystem";

export function ProjectSelect() {
    const projectContext = useProject();
    const fs = useFileSystem();

    const [projectsList, setProjectsList] = useState<string[]>([]);
    useEffect(() => {
        (async () => {
            const folders = [];
            console.log("iterating folders");
            for await (const [name, handle] of fs.rootDir.entries()) {
                console.log(name);
                if (handle.kind == "directory") {
                    folders.push(name);
                }
            }
            setProjectsList(folders);
        })();
    }, [projectContext.projectFolder]);

    console.log(projectsList);
    return (
        <div class={style.projectSel}>
            <img src={projectIcon} />
            <select defaultValue="new-project" value={projectContext.projectName} onChange={(e) => {
                const select = e.target as HTMLSelectElement;
                let value = select.value;
                if (value === "") {
                    value = prompt("Введите название нового проекта:", "new-project");
                }
                projectContext.setProjectName(value);
            }}>
                <option value="">Create New Project</option>
                <option disabled>----------</option>
                {projectsList.map((name) => <option>{name}</option>)}
            </select>
            <button onClick={async () => {
                const [fileHandle] = await window.showOpenFilePicker({
                    multiple: false,
                    types: [
                        {
                            description: 'Сжатые проекты',
                            accept: {
                                'application/x-zip': ['.zip'],
                            },
                        },
                    ],
                    excludeAcceptAllOption: false,
                }) as FileSystemFileHandle[];
                const file = await fileHandle.getFile();
                const zip = new JSZip();
                await zip.loadAsync(await file.arrayBuffer());
                const entries: {relativePath: string, zipEntry: JSZip.JSZipObject}[] = [];
                zip.forEach((relativePath, zipEntry) => {
                    entries.push({relativePath, zipEntry});
                });
                while (entries.length > 0) {
                    const {relativePath, zipEntry} = entries.pop();
                    console.log(relativePath, zipEntry);
                    const isFolder = relativePath.endsWith("/");
                    const crumbs = relativePath.split(PATH_SEPARATOR);
                    if (isFolder) {
                        crumbs.pop();
                    }
                    
                    let currentFolder = fs.rootDir;
                    while (crumbs.length > (isFolder ? 0 : 1)) {
                        const name = crumbs.shift();
                        currentFolder = await currentFolder.getDirectoryHandle(name, {create: true});
                    }
                    if (!isFolder) {
                        const name = crumbs.shift();
                        const fileHandle = await currentFolder.getFileHandle(name, {create: true});
                        const writable = await fileHandle.createWritable();
                        writable.write(await zipEntry.async("arraybuffer") as ArrayBuffer);
                        writable.close();
                    }
                }
            }}>Import</button>
            <button onClick={async () => {
                const zip = new JSZip();
                async function addFolder(folder: FileSystemDirectoryHandle, crumbs: string[]) {
                    const newCrumbs = [...crumbs, folder.name];
                    const path = combinePath(newCrumbs);
                    // zip.folder(path);
                    zip.file(path, null, { dir: true });
                    for await (const [name, handle] of folder.entries()) {
                        if (handle.kind === 'directory') {
                            await addFolder(handle as FileSystemDirectoryHandle, newCrumbs);
                        } else {
                            const fileHandle = handle as FileSystemFileHandle;
                            const file = await fileHandle.getFile();
                            const filePath = combinePath([path, name]);
                            console.log(filePath);
                            zip.file(filePath, await file.arrayBuffer(), { binary: true });
                        }
                    }
                }
                await addFolder(projectContext.projectFolder, []);
                const bytes = await zip.generateAsync({ type: "uint8array" });
                const blob = new Blob([bytes], { type: 'application/octet-stream' });
                const blobUrl = URL.createObjectURL(blob);
                {
                    const a = window.document.createElement('a');
                    a.href = blobUrl;
                    a.download = `${projectContext.projectName}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }}>Export</button>
        </div>
    );
}